/*
 * Mamanuh Boutique — movimento.
 *
 * Tudo aqui é decorativo: o conteúdo e a navegação funcionam sem este arquivo.
 * - Revelação das seções, títulos palavra por palavra e fotos em "cortina".
 * - Parallax leve das fotos durante a rolagem (sem controlar a rolagem).
 * - Cabeçalho que se recolhe ao descer e volta ao subir, com barra de progresso.
 * - Com mouse: fotos da abertura reagem ao ponteiro, cursor "Ver peça",
 *   botões magnéticos e zoom na foto dos detalhes.
 * - Looks: a foto aproxima a peça apontada na lista.
 * Com "reduzir movimento" ativo, só ficam os estados finais, sem animação.
 */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  /* ---------- títulos palavra por palavra ---------- */

  function splitWords(el) {
    if (el.dataset.split) return;
    el.dataset.split = "1";
    el.setAttribute("aria-label", el.textContent.trim());
    var words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map(function (w, i) {
      var safe = w.replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
      return '<span class="word-mask" aria-hidden="true"><span class="word" style="--w:' + i + '">' + safe + "</span></span>";
    }).join(" ");
  }

  /* ---------- revelação ao rolar ---------- */

  function setupReveal() {
    var targets = $$(".reveal, .reveal-media, .section-head, [data-split], [data-reveal-group]");
    if (!("IntersectionObserver" in window) || reduce.matches) {
      targets.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* ---------- rolagem: cabeçalho, progresso e parallax ---------- */

  function setupScroll() {
    var header = document.querySelector(".site-header");
    var bar = document.querySelector(".scroll-progress");
    var parallax = $$("[data-parallax]");
    var visible = new Set();
    var lastY = window.scrollY;
    var ticking = false;

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { e.isIntersecting ? visible.add(e.target) : visible.delete(e.target); });
        requestTick();
      }, { rootMargin: "10% 0px" });
      parallax.forEach(function (el) { io.observe(el); });
    }

    function update() {
      ticking = false;
      var y = window.scrollY;
      var vh = window.innerHeight;
      var max = document.documentElement.scrollHeight - vh;

      header.classList.toggle("is-scrolled", y > 12);
      /* Recolhe ao descer; volta ao subir, perto do topo ou com o menu/foco no cabeçalho. */
      var keep = header.classList.contains("is-open") || header.contains(document.activeElement);
      if (y > lastY + 4 && y > 480 && !keep) header.classList.add("is-hidden");
      else if (y < lastY - 4 || y < 480 || keep) header.classList.remove("is-hidden");
      lastY = y;

      if (bar) bar.style.transform = "scaleX(" + (max > 0 ? clamp(y / max, 0, 1) : 0) + ")";

      if (reduce.matches) return;
      visible.forEach(function (el) {
        var r = el.getBoundingClientRect();
        var speed = parseFloat(el.getAttribute("data-parallax")) || 0.08;
        /* -1 quando a foto entra por baixo, 1 quando sai por cima. */
        var progress = clamp((vh / 2 - (r.top + r.height / 2)) / (vh / 2 + r.height / 2), -1, 1);
        var img = el.querySelector("img");
        if (img) img.style.translate = "0 " + (progress * speed * r.height).toFixed(1) + "px";
      });
    }

    function requestTick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
    header.addEventListener("focusin", function () { header.classList.remove("is-hidden"); });
    window.addEventListener("scroll", requestTick, { passive: true });
    window.addEventListener("resize", requestTick);
    update();
  }

  /* ---------- abertura reage ao ponteiro ---------- */

  function setupHeroPointer() {
    var hero = document.querySelector(".hero");
    if (!hero) return;
    var layers = $$("[data-depth]", hero);
    var tx = 0, ty = 0, x = 0, y = 0, raf = 0;

    function frame() {
      x = lerp(x, tx, 0.08); y = lerp(y, ty, 0.08);
      layers.forEach(function (el) {
        var d = parseFloat(el.getAttribute("data-depth"));
        el.style.translate = (x * d).toFixed(2) + "px " + (y * d).toFixed(2) + "px";
      });
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.05 ? requestAnimationFrame(frame) : 0;
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }

    hero.addEventListener("pointermove", function (e) {
      if (!finePointer.matches || reduce.matches) return;
      var r = hero.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      kick();
    });
    hero.addEventListener("pointerleave", function () { tx = 0; ty = 0; kick(); });
  }

  /* ---------- cursor "Ver peça" ---------- */

  function setupCursor() {
    var dot = document.createElement("div");
    dot.className = "cursor";
    dot.setAttribute("aria-hidden", "true");
    dot.innerHTML = '<span class="cursor-label"></span>';
    document.body.appendChild(dot);
    var label = dot.firstChild;
    var tx = -100, ty = -100, x = -100, y = -100, raf = 0, active = null;

    function frame() {
      x = lerp(x, tx, 0.22); y = lerp(y, ty, 0.22);
      dot.style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0)";
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.1 ? requestAnimationFrame(frame) : 0;
    }

    document.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse" || reduce.matches) return;
      tx = e.clientX; ty = e.clientY;
      var target = e.target.closest ? e.target.closest("[data-cursor]") : null;
      if (target !== active) {
        active = target;
        if (target) label.textContent = target.getAttribute("data-cursor");
        dot.classList.toggle("is-active", !!target);
        document.documentElement.classList.toggle("has-cursor", !!target);
        if (target) { x = tx; y = ty; }
      }
      if (!raf) raf = requestAnimationFrame(frame);
    });
    document.addEventListener("pointerleave", function () {
      active = null;
      dot.classList.remove("is-active");
      document.documentElement.classList.remove("has-cursor");
    });
    /* Ao clicar e abrir um painel, esconde o cursor. */
    document.addEventListener("click", function () {
      active = null;
      dot.classList.remove("is-active");
      document.documentElement.classList.remove("has-cursor");
    });
  }

  /* ---------- botões magnéticos ---------- */

  function setupMagnetic() {
    document.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse" || reduce.matches) return;
      var el = e.target.closest ? e.target.closest("[data-magnetic], .btn-primary, .btn-inverse, .wa-float") : null;
      if (!el) return;
      var r = el.getBoundingClientRect();
      var dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      var dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      el.style.translate = (dx * 5).toFixed(1) + "px " + (dy * 4).toFixed(1) + "px";
      if (!el.dataset.magnetBound) {
        el.dataset.magnetBound = "1";
        el.addEventListener("pointerleave", function () { el.style.translate = ""; });
      }
    });
  }

  /* ---------- zoom na foto dos detalhes ---------- */

  function setupZoom() {
    document.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse" || reduce.matches) return;
      var fig = e.target.closest ? e.target.closest("[data-zoom]") : null;
      if (!fig) return;
      var img = fig.querySelector("img");
      if (!img) return;
      var r = fig.getBoundingClientRect();
      img.style.transformOrigin = ((e.clientX - r.left) / r.width * 100).toFixed(1) + "% " + ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%";
      fig.classList.add("is-zoomed");
      if (!fig.dataset.zoomBound) {
        fig.dataset.zoomBound = "1";
        fig.addEventListener("pointerleave", function () { fig.classList.remove("is-zoomed"); });
      }
    });
  }

  /* ---------- looks: foto aproxima a peça apontada ---------- */

  function setupLookFocus() {
    $$(".look").forEach(function (look) {
      var img = look.querySelector("[data-look-media] img");
      if (!img) return;
      var base = img.style.objectPosition;
      function focus(btn) {
        if (reduce.matches) return;
        var pos = btn && btn.getAttribute("data-focus");
        look.classList.toggle("is-focused", !!pos);
        img.style.objectPosition = pos || base;
        $$(".look-item", look).forEach(function (b) { b.classList.toggle("is-current", b === btn && !!pos); });
      }
      $$(".look-item", look).forEach(function (btn) {
        btn.addEventListener("pointerenter", function () { focus(btn); });
        btn.addEventListener("focus", function () { focus(btn); });
        btn.addEventListener("pointerleave", function () { focus(null); });
        btn.addEventListener("blur", function () { focus(null); });
      });
    });
  }

  window.MamanuhMotion = {
    init: function () {
      $$("[data-split]").forEach(splitWords);
      requestAnimationFrame(function () { document.documentElement.classList.add("is-loaded"); });
      /* As entradas da abertura esperam a animação do logotipo terminar. */
      (window.MamanuhIntro || Promise.resolve()).then(setupReveal);
      setupScroll();
      setupHeroPointer();
      setupLookFocus();
      if (finePointer.matches) {
        setupCursor();
        setupMagnetic();
        setupZoom();
      }
    }
  };
})();
