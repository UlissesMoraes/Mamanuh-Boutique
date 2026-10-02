/*
 * Mamanuh Boutique — mapa da seção "Visite a loja".
 *
 * O Leaflet (assets/vendor/leaflet) e os mapas do OpenStreetMap/CARTO só
 * carregam quando a seção se aproxima da tela. O marcador é a foto da fachada.
 * Se algo falhar, a foto da fachada continua no lugar do mapa.
 */
(function () {
  "use strict";

  var SITE = window.SITE;
  var C = SITE && SITE.contact;
  var cfg = C && C.map;
  var root = document.querySelector("[data-map]");
  if (!root || !cfg || typeof cfg.lat !== "number" || typeof cfg.lng !== "number") return;

  var canvas = root.querySelector(".map-canvas");
  var note = root.querySelector("[data-map-note]");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var started = false;

  function esc(value) {
    return String(value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function addressText() {
    var a = C.address;
    return a.street + " – " + a.district + ", " + a.city + " – " + a.state;
  }

  function directionsUrl() {
    var a = C.address;
    return "https://www.google.com/maps/dir/?api=1&destination=" +
      encodeURIComponent(a.street + ", " + a.district + ", " + a.city + " - " + a.state);
  }

  function load(tag, attrs) {
    return new Promise(function (resolve, reject) {
      var el = document.createElement(tag);
      Object.keys(attrs).forEach(function (k) { el[k] = attrs[k]; });
      el.onload = resolve;
      el.onerror = reject;
      document.head.appendChild(el);
    });
  }

  function loadLeaflet() {
    if (window.L) return Promise.resolve();
    return Promise.all([
      load("link", { rel: "stylesheet", href: "assets/vendor/leaflet/leaflet.css" }),
      load("script", { src: "assets/vendor/leaflet/leaflet.js" })
    ]);
  }

  function build() {
    var L = window.L;
    var touch = window.matchMedia("(hover: none)").matches;

    var map = L.map(canvas, {
      center: [cfg.lat, cfg.lng],
      zoom: cfg.zoom || 16,
      zoomControl: false,
      scrollWheelZoom: false,   /* a rolagem da página nunca é capturada pelo mapa */
      dragging: !touch,         /* no celular, o dedo rola a página; use os botões + e − */
      tap: false,
      attributionControl: true
    });
    L.control.zoom({ position: "topright", zoomInTitle: "Aproximar", zoomOutTitle: "Afastar" }).addTo(map);
    map.attributionControl.setPrefix(false);
    /* Centraliza o conjunto foto + ponta, não só a ponta do marcador. */
    map.panBy([0, -46], { animate: false });

    var tiles = L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      subdomains: "abcd",
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>'
    }).addTo(map);

    var photo = "assets/img/" + cfg.photo + "-480.webp";
    var icon = L.divIcon({
      className: "map-pin-wrap",
      html: '<span class="map-pin"><span class="map-pin-photo"><img src="' + esc(photo) + '" alt=""></span><span class="map-pin-tail" aria-hidden="true"></span></span>',
      iconSize: [76, 92],
      iconAnchor: [38, 92],
      popupAnchor: [0, -90]
    });

    var marker = L.marker([cfg.lat, cfg.lng], {
      icon: icon,
      keyboard: true,
      title: SITE.brand.name,
      alt: SITE.brand.name,
      riseOnHover: true
    }).addTo(map);

    marker.bindPopup(
      '<div class="map-popup">' +
        '<img src="' + esc("assets/img/" + cfg.photo + "-480.webp") + '" alt="' + esc(cfg.photoAlt || "") + '" width="480" height="452">' +
        '<p class="map-popup-name">' + esc(SITE.brand.name) + "</p>" +
        '<p class="map-popup-address">' + esc(addressText()) + "</p>" +
        '<a class="map-popup-link" href="' + esc(directionsUrl()) + '" target="_blank" rel="noopener">Como chegar<span class="visually-hidden"> (abre em nova aba)</span></a>' +
      "</div>",
      { maxWidth: 240, minWidth: 220, closeButton: true, autoPanPadding: [24, 24] }
    );

    /* Botão de fechar do popup com rótulo em português. */
    marker.on("popupopen", function (e) {
      var close = e.popup.getElement() && e.popup.getElement().querySelector(".leaflet-popup-close-button");
      if (close) close.setAttribute("aria-label", "Fechar");
    });

    tiles.once("load", function () {
      root.classList.add("is-ready");
      /* O marcador "cai" uma vez quando o mapa aparece. */
      if (!reduce.matches) {
        var el = marker.getElement();
        if (el) el.classList.add("is-dropping");
      }
    });
    /* Mesmo sem os mapas de fundo, mostra o marcador após um tempo. */
    setTimeout(function () { root.classList.add("is-ready"); }, 4000);

    if (!cfg.confirmed && SITE.demo !== false && note) {
      note.hidden = false;
      note.innerHTML = 'Localização aproximada <span class="tag-pending">A confirmar</span>';
    }

    /* Recalcula o tamanho quando o layout muda (rotação, redimensionamento). */
    window.addEventListener("resize", function () { map.invalidateSize(); });
  }

  function start() {
    if (started) return;
    started = true;
    loadLeaflet().then(build).catch(function () {
      root.classList.add("is-failed"); /* fica a foto da fachada */
    });
  }

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      if (entries.some(function (e) { return e.isIntersecting; })) { io.disconnect(); start(); }
    }, { rootMargin: "600px 0px" });
    io.observe(root);
  } else {
    start();
  }
})();
