/*
 * Mamanuh Boutique — comportamento da página.
 * Lê window.SITE (js/config.js) e monta coleções, catálogo, looks, contato e FAQ.
 */
(function () {
  "use strict";

  var SITE = window.SITE;
  var C = SITE.contact;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------- utilidades ---------- */

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function esc(value) {
    return String(value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function pendingTag(text) {
    return SITE.demo ? ' <span class="tag-pending">' + esc(text || "A confirmar") + "</span>" : "";
  }

  function refLabel(image) {
    return image && image.illustrative && SITE.demo ? '<span class="ref-label">Imagem de referência</span>' : "";
  }

  function imgTag(image, sizes, opts) {
    opts = opts || {};
    var base = "assets/img/" + image.file;
    return '<img src="' + base + '-480.webp"' +
      ' srcset="' + base + "-480.webp 480w, " + base + '-900.webp 900w"' +
      ' sizes="' + (sizes || "50vw") + '"' +
      ' width="480" height="640"' +
      (opts.eager ? "" : ' loading="lazy"') + ' decoding="async"' +
      (image.position ? ' style="object-position:' + esc(image.position) + '"' : "") +
      ' alt="' + esc(image.alt || "") + '">';
  }

  function fill(template, item) { return template.replace("{item}", item); }

  function whatsappUrl(message) {
    if (!C.whatsapp) return null;
    return "https://wa.me/" + String(C.whatsapp).replace(/\D/g, "") + "?text=" + encodeURIComponent(message);
  }

  /* Botão ou link de consulta. Sem WhatsApp confirmado, abre a prévia da mensagem. */
  function consultControl(label, message, className) {
    var url = whatsappUrl(message);
    if (url) {
      return '<a class="' + className + '" href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(label) +
        '<span class="visually-hidden"> (abre o WhatsApp em nova aba)</span></a>';
    }
    return '<button class="' + className + '" type="button" data-message="' + esc(message) + '">' + esc(label) + "</button>";
  }

  function addressLine() {
    var a = C.address;
    return a.street + " – " + a.district + ", " + a.city + (a.state ? " – " + a.state : "") + (a.postalCode ? ", " + a.postalCode : "");
  }

  function mapsUrl() {
    return C.mapsUrl || "https://www.google.com/maps/search/?api=1&query=" +
      encodeURIComponent(C.address.street + ", " + C.address.district + ", " + C.address.city + " - " + C.address.state);
  }

  function productById(id) {
    for (var i = 0; i < SITE.products.length; i++) if (SITE.products[i].id === id) return SITE.products[i];
    return null;
  }

  /* ---------- marca, demonstração e contatos ---------- */

  function renderBrand() {
    if (!SITE.demo) $$("[data-demo-only]").forEach(function (el) { el.remove(); });
    if (SITE.brand.logo) {
      $$("[data-brand-mark]").forEach(function (el) {
        el.innerHTML = '<img src="' + esc(SITE.brand.logo) + '" alt="' + esc(SITE.brand.name) + '">';
      });
    }
    var year = $("[data-year]");
    if (year) year.textContent = new Date().getFullYear();
  }

  var IG_ICON = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="17.3" cy="6.7" r="1" fill="currentColor"/></svg>';

  function renderInstagram() {
    var url = C.instagram;
    $$("[data-instagram-slot]").forEach(function (slot) {
      var where = slot.getAttribute("data-instagram-slot");
      if (url) {
        var attrs = ' href="' + esc(url) + '" target="_blank" rel="noopener"';
        if (where === "header") slot.innerHTML = '<a class="icon-link"' + attrs + ' aria-label="Instagram da Mamanuh Boutique (abre em nova aba)">' + IG_ICON + "</a>";
        else if (where === "section") slot.innerHTML = '<a class="btn btn-outline"' + attrs + ">Ver no Instagram</a>";
        else slot.innerHTML = "<a" + attrs + ">Instagram</a>";
      } else {
        /* Sem perfil confirmado: nenhum link fictício. */
        if (where === "header") slot.remove();
        else if (where === "section") slot.innerHTML = '<span class="insta-pending"><span class="btn btn-outline" aria-disabled="true">Ver no Instagram</span><span class="note">Perfil oficial a confirmar.</span></span>';
        else slot.innerHTML = '<span class="pending">Instagram</span>' + pendingTag();
      }
    });
  }

  function renderContact() {
    var a = C.address;
    var phoneHtml = '<a href="tel:' + esc(C.phone.tel) + '">' + esc(C.phone.display) + "</a>" + (C.phone.confirmed ? "" : pendingTag());

    $('[data-contact="address"]').innerHTML = esc(addressLine()) + (a.confirmed ? "" : pendingTag());
    $('[data-contact="phone"]').innerHTML = phoneHtml;
    $('[data-contact="hours"]').innerHTML = C.hours && C.hours.length
      ? C.hours.map(function (h) { return esc(h.days) + ": " + esc(h.time); }).join("<br>")
      : '<span class="pending">Horários</span>' + pendingTag();
    $('[data-contact="whatsapp"]').innerHTML = C.whatsapp
      ? '<a href="' + esc(whatsappUrl(SITE.messages.general)) + '" target="_blank" rel="noopener">Iniciar conversa</a>'
      : '<span class="pending">Número</span>' + pendingTag();
    $('[data-contact="instagram"]').innerHTML = C.instagram
      ? '<a href="' + esc(C.instagram) + '" target="_blank" rel="noopener">' + esc(C.instagram.replace(/^https?:\/\/(www\.)?instagram\.com\//, "@").replace(/\/$/, "")) + "</a>"
      : '<span class="pending">Perfil</span>' + pendingTag();

    var maps = $("[data-maps-link]");
    maps.href = mapsUrl();
    maps.innerHTML = 'Abrir localização<span class="visually-hidden"> (abre o mapa em nova aba)</span>';

    $('[data-footer="address"]').innerHTML = esc(a.street) + "<br>" + esc(a.district + ", " + a.city + " – " + a.state);
    $('[data-footer="phone"]').innerHTML = phoneHtml;

    $('[data-fact="segment"]').textContent = SITE.brand.segment;
    $('[data-fact="legalName"]').innerHTML = esc(SITE.brand.legalName) + pendingTag("Cadastro público");
  }

  /* ---------- coleções ---------- */

  function renderCollections() {
    var root = $("[data-collections]");
    root.innerHTML = SITE.collections.map(function (col, i) {
      return '<a class="collection reveal" href="#pecas" data-cursor="Ver coleção" data-collection="' + esc(col.filter || "") + '">' +
        '<figure class="collection-media reveal-media" data-parallax="0.05">' + imgTag(col.image, i === 0 ? "(min-width: 720px) 58vw, 100vw" : "(min-width: 720px) 40vw, 100vw") + refLabel(col.image) + "</figure>" +
        '<span class="collection-body">' +
          '<span class="collection-name">' + esc(col.name) + (col.confirmed ? "" : pendingTag("Exemplo")) + "</span>" +
          '<span class="link-arrow" aria-hidden="true">Ver peças</span>' +
          '<span class="collection-desc">' + esc(col.description) + "</span>" +
        "</span></a>";
    }).join("");

    root.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-collection]");
      if (!btn) return;
      e.preventDefault();
      if (filtersEnabled) setFilter(btn.getAttribute("data-collection"));
      document.getElementById("pecas").scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth" });
      var heading = document.getElementById("pecas-title");
      heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });
    });
  }

  /* ---------- catálogo ---------- */

  var filtersEnabled = false;
  var currentFilter = "";

  function categories() {
    var seen = [];
    SITE.products.forEach(function (p) { if (p.category && seen.indexOf(p.category) < 0) seen.push(p.category); });
    return seen;
  }

  function renderProducts() {
    var grid = $("[data-products]");
    grid.classList.add("stagger");
    grid.innerHTML = SITE.products.map(function (p) {
      var img = p.images && p.images[0];
      return '<li class="product-card reveal" data-category="' + esc(p.category || "") + '">' +
        '<button class="product-open" type="button" data-cursor="Ver peça" data-product="' + esc(p.id) + '" aria-label="Ver detalhes: ' + esc(p.name) + '">' +
          '<span class="product-media reveal-media">' + (img ? imgTag(img, "(min-width: 1100px) 22vw, (min-width: 720px) 30vw, 46vw") + refLabel(img) : "") + "</span>" +
        "</button>" +
        '<div class="product-text">' +
          (p.category ? '<p class="product-category">' + esc(p.category) + "</p>" : "") +
          '<h3 class="product-name">' + esc(p.name) + "</h3>" +
          (p.price ? '<p class="product-price">' + esc(p.price) + "</p>" : "") +
        "</div>" +
        consultControl("Consultar esta peça", fill(SITE.messages.product, p.name + (p.ref ? " (" + p.ref + ")" : "")), "btn btn-outline btn-sm") +
      "</li>";
    }).join("");

    grid.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-product]");
      if (btn) openProduct(btn.getAttribute("data-product"), btn);
    });

    var cats = categories();
    filtersEnabled = SITE.products.length >= SITE.filters.minProducts && cats.length >= SITE.filters.minCategories;
    if (!filtersEnabled) return;

    var bar = $("[data-filters]");
    bar.hidden = false;
    bar.setAttribute("role", "group");
    bar.setAttribute("aria-label", "Filtrar peças por categoria");
    bar.innerHTML = ['<button class="chip" type="button" data-filter="" aria-pressed="true">Todas</button>']
      .concat(cats.map(function (c) { return '<button class="chip" type="button" data-filter="' + esc(c) + '" aria-pressed="false">' + esc(c) + "</button>"; }))
      .join("");
    bar.addEventListener("click", function (e) {
      var chip = e.target.closest("[data-filter]");
      if (chip) setFilter(chip.getAttribute("data-filter"));
    });
  }

  function setFilter(value) {
    if (!filtersEnabled) return;
    if (categories().indexOf(value) < 0) value = "";
    currentFilter = value;
    $$("[data-filter]").forEach(function (chip) { chip.setAttribute("aria-pressed", String(chip.getAttribute("data-filter") === value)); });
    var cards = $$(".product-card");
    var shown = cards.filter(function (card) { return !value || card.getAttribute("data-category") === value; }).length;
    $("[data-filter-status]").textContent = shown + (shown === 1 ? " peça" : " peças") + (value ? " em " + value : "");

    var grid = $("[data-products]");
    var apply = function () {
      var i = 0;
      cards.forEach(function (card) {
        var match = !value || card.getAttribute("data-category") === value;
        card.hidden = !match;
        card.classList.remove("is-entering");
        if (!match) return;
        card.classList.add("is-in");
        $$(".reveal-media", card).forEach(function (m) { m.classList.add("is-in"); });
        card.style.setProperty("--i", i++);
        void card.offsetWidth; /* reinicia a animação de entrada */
        card.classList.add("is-entering");
      });
      grid.classList.remove("is-filtering");
    };
    if (reduceMotion.matches) { apply(); return; }
    grid.classList.add("is-filtering");
    clearTimeout(setFilter.timer);
    setFilter.timer = setTimeout(apply, 220);
  }

  /* ---------- looks ---------- */

  function renderLooks() {
    var root = $("[data-looks]");
    root.innerHTML = SITE.looks.map(function (look, n) {
      var items = look.items.map(productById).filter(Boolean);
      return '<article class="look">' +
        '<figure class="look-media reveal-media" data-parallax="0.06" data-look-media data-cursor="Ver look">' + imgTag(look.image, "(min-width: 840px) 50vw, 100vw") + refLabel(look.image) + "</figure>" +
        '<div class="look-copy reveal">' +
          '<p class="look-index" aria-hidden="true">' + String(n + 1).padStart(2, "0") + "</p>" +
          (look.ref ? '<p class="look-ref">' + esc(look.ref) + "</p>" : "") +
          '<h3 class="look-name">' + esc(look.name) + "</h3>" +
          '<p class="look-desc">' + esc(look.description) + "</p>" +
          '<ul class="look-items" aria-label="Peças deste look">' + items.map(function (p) {
            var focus = p.images && p.images[0] && p.images[0].file === look.image.file ? p.images[0].position : "";
            return '<li><button class="look-item" type="button" data-product="' + esc(p.id) + '"' + (focus ? ' data-focus="' + esc(focus) + '"' : "") +
              "><span>" + esc(p.name) + '</span><small>Ver detalhes <span aria-hidden="true">→</span></small></button></li>';
          }).join("") + "</ul>" +
          consultControl("Consultar este look", fill(SITE.messages.look, look.name + (look.ref ? " (" + look.ref + ")" : "")), "btn btn-primary") +
        "</div></article>";
    }).join("");

    root.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-product]");
      if (btn) openProduct(btn.getAttribute("data-product"), btn);
    });
  }

  /* ---------- detalhes da peça ---------- */

  var detail = document.getElementById("detalhe");
  var preview = document.getElementById("previa");
  var lastTrigger = null;

  function spec(label, value) {
    var v = Array.isArray(value) ? value.join(", ") : value;
    return "<div><dt>" + esc(label) + "</dt><dd>" + (v ? esc(v) : '<span class="pending">A confirmar com a boutique</span>') + "</dd></div>";
  }

  function openProduct(id, trigger) {
    var p = productById(id);
    if (!p) return;
    var imgs = p.images || [];
    var html = '<button class="sheet-close" type="button" data-close aria-label="Fechar detalhes"></button>' +
      '<div class="detail">' +
        '<div class="detail-gallery">' +
          (imgs[0] ? '<figure data-main-figure data-zoom>' + imgTag(imgs[0], "(min-width: 720px) 480px, 100vw", { eager: true }) + refLabel(imgs[0]) + "</figure>" : "") +
          (imgs.length > 1 ? '<div class="detail-thumbs" role="group" aria-label="Fotos da peça">' + imgs.map(function (im, i) {
            return '<button type="button" data-thumb="' + i + '" aria-current="' + (i === 0) + '" aria-label="Foto ' + (i + 1) + ' de ' + imgs.length + '">' + imgTag(im, "64px") + "</button>";
          }).join("") + "</div>" : (SITE.demo ? '<p class="note">Fotos adicionais aguardando a boutique.</p>' : "")) +
        "</div>" +
        "<div>" +
          (p.ref ? '<p class="eyebrow">' + esc(p.ref) + "</p>" : "") +
          '<h2 class="detail-title" id="detalhe-title">' + esc(p.name) + "</h2>" +
          (p.description ? '<p class="detail-desc">' + esc(p.description) + "</p>" : "") +
          '<dl class="detail-specs">' +
            spec("Categoria", p.category) +
            (p.price ? spec("Preço", p.price) : "") +
            spec("Cores", p.colors) +
            spec("Tamanhos", p.sizes) +
            spec("Composição", p.composition) +
          "</dl>" +
          consultControl("Consultar esta peça", fill(SITE.messages.product, p.name + (p.ref ? " (" + p.ref + ")" : "")), "btn btn-primary btn-block") +
          '<p class="note detail-note">Disponibilidade, tamanhos e preço são confirmados pela equipe na conversa.</p>' +
        "</div>" +
      "</div>";
    $("[data-detail]").innerHTML = html;

    $$("[data-thumb]", detail).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var i = +btn.getAttribute("data-thumb");
        $("[data-main-figure]", detail).innerHTML = imgTag(imgs[i], "(min-width: 720px) 480px, 100vw", { eager: true }) + refLabel(imgs[i]);
        $$("[data-thumb]", detail).forEach(function (b) { b.setAttribute("aria-current", String(b === btn)); });
      });
    });

    openDialog(detail, trigger);
  }

  function openDialog(dialog, trigger) {
    if (dialog.open) dialog.close();
    lastTrigger = trigger || document.activeElement;
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    document.body.classList.add("is-locked");
    dialog.scrollTop = 0;
    var close = $("[data-close]", dialog);
    if (close) close.focus();
  }

  function closeDialog(dialog) {
    if (typeof dialog.close === "function") dialog.close();
    else { dialog.removeAttribute("open"); onDialogClosed(); }
  }

  function onDialogClosed() {
    if (detail.open || preview.open) return;
    document.body.classList.remove("is-locked");
    if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus();
  }

  [detail, preview].forEach(function (dialog) {
    dialog.addEventListener("close", onDialogClosed);
    dialog.addEventListener("click", function (e) {
      if (e.target.closest("[data-close]")) { closeDialog(dialog); return; }
      if (e.target === dialog) closeDialog(dialog); /* clique no fundo escurecido */
    });
  });

  /* ---------- consulta (WhatsApp ou prévia) ---------- */

  function showPreview(message, trigger) {
    $("#previa-texto").value = message;
    $("[data-copy-status]").textContent = "";
    if (detail.open) detail.close();
    openDialog(preview, trigger);
  }

  $("[data-copy]").addEventListener("click", function () {
    var text = $("#previa-texto").value;
    var status = $("[data-copy-status]");
    function done() { status.textContent = "Mensagem copiada."; }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, function () { status.textContent = "Selecione o texto e copie manualmente."; });
    } else {
      var field = $("#previa-texto");
      field.select();
      try { document.execCommand("copy"); done(); } catch (err) { status.textContent = "Selecione o texto e copie manualmente."; }
    }
  });

  function setupConsultButtons() {
    /* Botões gerais do HTML viram links quando o WhatsApp estiver confirmado. */
    $$("[data-consult]").forEach(function (btn) {
      var url = whatsappUrl(SITE.messages.general);
      if (!url) { btn.setAttribute("data-message", SITE.messages.general); return; }
      var a = document.createElement("a");
      a.className = btn.className;
      a.innerHTML = btn.innerHTML + '<span class="visually-hidden"> (abre o WhatsApp em nova aba)</span>';
      if (btn.getAttribute("aria-label")) a.setAttribute("aria-label", btn.getAttribute("aria-label") + " (abre em nova aba)");
      a.href = url; a.target = "_blank"; a.rel = "noopener";
      btn.replaceWith(a);
    });

    document.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-message]");
      if (!btn) return;
      closeMenu(false);
      showPreview(btn.getAttribute("data-message"), btn);
    });
  }

  /* ---------- sobre e FAQ ---------- */

  function renderAbout() {
    var about = SITE.about;
    $("[data-about-media]").setAttribute("data-parallax", "0.07");
    if (about.image) $("[data-about-media]").innerHTML = imgTag(about.image, "(min-width: 840px) 50vw, 100vw") + refLabel(about.image);
    $("[data-about-text]").innerHTML = about.paragraphs && about.paragraphs.length
      ? about.paragraphs.map(function (t) { return "<p>" + esc(t) + "</p>"; }).join("")
      : '<div class="placeholder-text"><strong>Espaço reservado para a história da boutique.</strong>' +
        "Aqui entram a proposta da loja, o estilo das peças e uma fotografia real do espaço ou da equipe, conforme o texto aprovado pela Mamanuh.</div>";
  }

  function renderInstagramGrid() {
    $("[data-instagram-grid]").innerHTML = (SITE.instagramImages || []).map(function (im) {
      return '<li class="reveal"><figure class="reveal-media">' + imgTag(im, "(min-width: 720px) 25vw, 50vw") + refLabel(im) + "</figure></li>";
    }).join("");
    $("[data-instagram-grid]").classList.add("stagger");
  }

  function renderFaq() {
    $("[data-faq]").innerHTML = SITE.faq.map(function (item) {
      return "<details><summary>" + esc(item.question) + '<span class="acc-icon" aria-hidden="true"></span></summary>' +
        '<div class="acc-body">' + (item.answer ? "<p>" + esc(item.answer) + "</p>" : "<p>Resposta pendente de confirmação pela boutique.</p>") + "</div></details>";
    }).join("");
  }

  /* ---------- cabeçalho e menu ---------- */

  var header = $(".site-header");
  var toggle = $(".menu-toggle");
  var menu = document.getElementById("menu-mobile");

  function openMenu() {
    menu.hidden = false;
    menu.classList.add("is-visible");
    header.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    $(".visually-hidden", toggle).textContent = "Fechar menu";
    document.body.classList.add("is-locked");
    $(".wa-float").classList.add("is-hidden");
    var first = $("a", menu);
    if (first) first.focus();
  }

  function closeMenu(returnFocus) {
    if (menu.hidden) return;
    menu.hidden = true;
    menu.classList.remove("is-visible");
    header.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    $(".visually-hidden", toggle).textContent = "Abrir menu";
    document.body.classList.remove("is-locked");
    $(".wa-float").classList.remove("is-hidden");
    if (returnFocus !== false) toggle.focus();
  }

  toggle.addEventListener("click", function () { menu.hidden ? openMenu() : closeMenu(); });
  menu.addEventListener("click", function (e) { if (e.target.closest("a")) closeMenu(false); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !menu.hidden) closeMenu();
    /* Mantém o foco dentro do menu aberto. */
    if (e.key === "Tab" && !menu.hidden) {
      var focusables = [toggle].concat($$("a, button", menu));
      var first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  window.matchMedia("(min-width: 960px)").addEventListener("change", function (mq) { if (mq.matches) closeMenu(false); });


  /* ---------- movimento e navegação ativa ---------- */

  function setupActiveNav() {
    if (!("IntersectionObserver" in window)) return;
    var links = $$('.nav-desktop a[href^="#"]');
    var map = {};
    links.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = map[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          links.forEach(function (l) { l.removeAttribute("aria-current"); });
          link.setAttribute("aria-current", "true");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });

    /* Esconde o botão flutuante quando o encerramento (com o mesmo CTA) está na tela. */
    var closing = $(".closing"), fab = $(".wa-float");
    new IntersectionObserver(function (entries) {
      fab.classList.toggle("is-hidden", entries[0].isIntersecting || !menu.hidden);
    }, { threshold: 0.35 }).observe(closing);
  }

  /* ---------- início ---------- */

  renderBrand();
  renderInstagram();
  renderContact();
  renderCollections();
  renderProducts();
  renderLooks();
  renderAbout();
  renderInstagramGrid();
  renderFaq();
  setupConsultButtons();
  setupActiveNav();

  /* Efeitos de movimento (js/motion.js) depois que o conteúdo existe. */
  if (window.MamanuhMotion) window.MamanuhMotion.init();
})();
