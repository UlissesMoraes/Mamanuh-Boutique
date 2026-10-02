/*
 * Mamanuh Boutique — monograma.
 *
 * O monograma "MM" foi redesenhado em vetor sobre o logotipo enviado pela
 * boutique (150 px). Ele é desenhado traço a traço (stroke-dashoffset) e recebe
 * um brilho que passa uma vez sobre as linhas.
 *
 * - [data-mono] recebe o SVG. Variantes: data-mono="ink" (grafite),
 *   "copper" (cobre claro, para fundo escuro) e "copper-deep" (cobre sobre claro).
 * - data-mono-weight="1.8" engrossa os traços em tamanhos pequenos.
 * - data-mono-draw="view" desenha quando aparece na tela; "now" desenha já.
 * - Abertura: uma vez por sessão, curta e pulável (clique, toque ou tecla).
 *   Desligue com `intro: false` em js/config.js. Não roda com movimento reduzido.
 */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var uid = 0;

  /* Traços em ordem de desenho. Coordenadas do logotipo ampliado 8x (viewBox abaixo). */
  var STROKES = [
    { w: 7, d: "M265,572 C190,560 135,500 133,420 C131,320 210,250 300,248 C370,246 420,280 462,350" },
    { w: 11, d: "M360,856 L367,394" },
    { w: 17, d: "M370,388 L620,714" },
    { w: 10, d: "M620,714 L842,392" },
    { w: 11, d: "M458,782 L462,362" },
    { w: 17, d: "M462,358 L634,592 L774,376" },
    { w: 10, d: "M771,382 L772,808" },
    { w: 10, d: "M846,390 L852,846" },
    { w: 8, d: "M628,612 C665,665 715,725 790,762 C840,786 920,790 965,770 C1030,742 1052,680 1048,620 C1044,540 990,478 925,465" }
  ];
  var VIEWBOX = "110 220 960 660";

  var GRADIENTS = {
    copper: [["0", "#f6d9c2"], [".45", "#d9a27e"], ["1", "#f0c8a8"]],
    "copper-deep": [["0", "#b98361"], [".5", "#8f5d3f"], ["1", "#ad7653"]]
  };

  /* weight engrossa os traços em tamanhos pequenos (cabeçalho, rodapé). */
  function svg(variant, title, weight) {
    var k = weight || 1;
    var id = "mm" + (++uid);
    var stroke = "currentColor";
    var defs = '<linearGradient id="' + id + '-sheen" gradientUnits="userSpaceOnUse" x1="-400" y1="220" x2="-100" y2="880">' +
      '<stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>';
    if (GRADIENTS[variant]) {
      stroke = "url(#" + id + "-fill)";
      defs += '<linearGradient id="' + id + '-fill" gradientUnits="userSpaceOnUse" x1="110" y1="220" x2="1070" y2="880">' +
        GRADIENTS[variant].map(function (s) { return '<stop offset="' + s[0] + '" stop-color="' + s[1] + '"/>'; }).join("") + "</linearGradient>";
    }
    var paths = function (cls, color) {
      return '<g class="' + cls + '" stroke="' + color + '">' + STROKES.map(function (s, i) {
        return '<path pathLength="1" style="--i:' + i + '" stroke-width="' + (s.w * k).toFixed(1) + '" d="' + s.d + '"/>';
      }).join("") + "</g>";
    };
    return '<svg class="mono-svg" viewBox="' + VIEWBOX + '" fill="none" stroke-linecap="round" stroke-linejoin="miter"' +
      (title ? ' role="img" aria-label="' + title + '"' : ' aria-hidden="true" focusable="false"') + ">" +
      "<defs>" + defs + "</defs>" + paths("mono-lines", stroke) + paths("mono-sheen", "url(#" + id + "-sheen)") + "</svg>";
  }

  /* Brilho: a faixa clara atravessa o monograma uma vez. */
  function sheen(el) {
    if (reduce.matches) return;
    var grad = el.querySelector('linearGradient[id$="-sheen"]');
    if (!grad) return;
    var start = null, dur = 1100;
    function frame(t) {
      if (start === null) start = t;
      var k = Math.min(1, (t - start) / dur);
      var e = 1 - Math.pow(1 - k, 3);
      var x = -400 + e * 1700;
      grad.setAttribute("x1", x); grad.setAttribute("x2", x + 300);
      if (k < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function draw(el, withSheen) {
    if (el.classList.contains("is-drawn")) return;
    el.classList.add("is-drawn");
    if (withSheen !== false) setTimeout(function () { sheen(el); }, reduce.matches ? 0 : 1250);
  }

  function mount() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-mono]"), function (el) {
      if (el.querySelector("svg")) return;
      el.classList.add("mono");
      el.innerHTML = svg(el.getAttribute("data-mono"), el.getAttribute("data-mono-label"), parseFloat(el.getAttribute("data-mono-weight")) || 1);
      var mode = el.getAttribute("data-mono-draw");
      if (!mode || reduce.matches) { el.classList.add("is-drawn"); return; }
      if (mode === "now") { draw(el); return; }
      if (!("IntersectionObserver" in window)) { draw(el); return; }
      var io = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { io.disconnect(); draw(el); }
      }, { threshold: 0.4 });
      io.observe(el);
    });

    /* Brilho ao passar o mouse sobre a marca do cabeçalho e do rodapé. */
    Array.prototype.forEach.call(document.querySelectorAll("[data-mono-hover]"), function (link) {
      var mono = link.querySelector(".mono");
      if (mono) link.addEventListener("pointerenter", function () { sheen(mono); });
    });
  }

  /* ---------- abertura ---------- */

  function intro() {
    var SITE = window.SITE || {};
    var seen = false;
    try { seen = sessionStorage.getItem("mm-intro") === "1"; } catch (e) { /* sem storage: mostra */ }
    if (SITE.intro === false || seen || reduce.matches) return Promise.resolve();
    try { sessionStorage.setItem("mm-intro", "1"); } catch (e) { /* ignora */ }

    return new Promise(function (resolve) {
      var root = document.documentElement;
      var overlay = document.createElement("div");
      overlay.className = "intro";
      overlay.setAttribute("aria-hidden", "true");
      overlay.innerHTML = '<div class="intro-inner"><div class="intro-mono" data-mono="copper-deep"></div>' +
        '<p class="intro-name"><span>Mamanuh</span><small>Boutique</small></p></div>';
      document.body.appendChild(overlay);
      root.classList.add("is-intro");

      var mono = overlay.querySelector("[data-mono]");
      mono.classList.add("mono");
      mono.innerHTML = svg("copper-deep");

      var timers = [];
      var done = false;
      function finish(fast) {
        if (done) return;
        done = true;
        timers.forEach(clearTimeout);
        overlay.classList.add("is-leaving");
        if (fast) overlay.classList.add("is-fast");
        root.classList.remove("is-intro");
        resolve();
        setTimeout(function () { overlay.remove(); }, fast ? 450 : 1000);
        ["pointerdown", "keydown", "wheel", "touchstart"].forEach(function (ev) { window.removeEventListener(ev, skip); });
      }
      function skip() { finish(true); }
      ["pointerdown", "keydown", "wheel", "touchstart"].forEach(function (ev) { window.addEventListener(ev, skip, { passive: true }); });

      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          draw(mono, false);
          timers.push(setTimeout(function () { overlay.classList.add("is-named"); }, 900));
          timers.push(setTimeout(function () { sheen(mono); }, 1150));
          timers.push(setTimeout(function () { finish(false); }, 2300));
        });
      });
    });
  }

  mount();
  window.MamanuhLogo = { svg: svg, draw: draw, sheen: sheen, mount: mount };
  window.MamanuhIntro = intro();
})();
