/*
 * Mamanuh Boutique — mapa da seção "Visite a loja" (Google Maps).
 *
 * Usa o mapa incorporado do Google Maps, que dispensa chave de API. Ele não
 * aceita marcador próprio, então o mapa fica parado e centralizado no endereço,
 * e a foto da fachada é desenhada por cima, exatamente sobre o pino do Google.
 * Clicar no mapa abre o Google Maps; clicar na foto abre o cartão da loja.
 * O mapa só carrega quando a seção se aproxima da tela.
 */
(function () {
  "use strict";

  var SITE = window.SITE;
  var C = SITE && SITE.contact;
  var cfg = C && C.map;
  var root = document.querySelector("[data-map]");
  if (!root || !cfg) return;

  var frame = root.querySelector("[data-map-frame]");
  var pin = root.querySelector("[data-map-pin]");
  var card = root.querySelector("[data-map-card]");
  var note = document.querySelector("[data-map-note]");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var started = false;

  var a = C.address;
  var query = cfg.query || (cfg.lat + "," + cfg.lng);
  var placeUrl = C.mapsUrl || "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(query);
  var directionsUrl = "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(query);

  root.querySelector("[data-map-link]").href = placeUrl;
  root.querySelector("[data-map-directions]").href = directionsUrl;
  root.querySelector("[data-map-address]").textContent = a.street + " – " + a.district + ", " + a.city + " – " + a.state;
  if (cfg.photo) {
    var photo = "assets/img/" + cfg.photo + "-480.webp";
    pin.querySelector("img").src = photo;
    card.querySelector("img").src = photo;
    if (cfg.photoAlt) card.querySelector("img").alt = cfg.photoAlt;
  }

  if (!cfg.confirmed && SITE.demo !== false && note) {
    note.hidden = false;
    note.innerHTML = 'Localização aproximada <span class="tag-pending">A confirmar</span>';
  }

  /* ---------- cartão da loja ---------- */

  function openCard() {
    card.hidden = false;
    pin.setAttribute("aria-expanded", "true");
    root.classList.add("is-card-open");
    card.querySelector("[data-map-close]").focus();
  }

  function closeCard(returnFocus) {
    if (card.hidden) return;
    card.hidden = true;
    pin.setAttribute("aria-expanded", "false");
    root.classList.remove("is-card-open");
    if (returnFocus !== false) pin.focus();
  }

  pin.addEventListener("click", function () { card.hidden ? openCard() : closeCard(); });
  card.querySelector("[data-map-close]").addEventListener("click", function () { closeCard(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeCard(); });
  document.addEventListener("click", function (e) {
    if (!card.hidden && !card.contains(e.target) && !pin.contains(e.target)) closeCard(false);
  });

  /* ---------- carregamento do Google Maps ---------- */

  function start() {
    if (started) return;
    started = true;
    var iframe = document.createElement("iframe");
    iframe.title = "Mapa do Google com a localização da Mamanuh Boutique";
    iframe.src = "https://www.google.com/maps?q=" + encodeURIComponent(query) + "&z=" + (cfg.zoom || 17) + "&hl=pt-BR&output=embed";
    iframe.loading = "lazy";
    iframe.referrerPolicy = "no-referrer-when-downgrade";
    iframe.tabIndex = -1; /* o mapa é só visual; o link e o botão ao lado dão acesso ao Google Maps */
    iframe.setAttribute("aria-hidden", "true");
    iframe.addEventListener("load", function () {
      root.classList.add("is-ready");
      pin.hidden = false;
      if (!reduce.matches) pin.classList.add("is-dropping");
    });
    frame.appendChild(iframe);
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
