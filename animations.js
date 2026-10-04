/* Animaciones sutiles (escritorio y móvil). Sin librerías.
   - Etiqueta elementos existentes con data-reveal / clases hv-* (no cambia el HTML).
   - Solo agrega html.anim-on (lo que oculta contenido) cuando todo cargó bien.
   - ?captura=1 o prefers-reduced-motion: no se activa nada y todo se ve en su estado final. */
(function () {
  'use strict';
  var root = document.documentElement;

  var params;
  try { params = new URLSearchParams(window.location.search); } catch (e) { params = null; }
  if (params && params.get('captura') === '1') { root.classList.add('anim-off'); return; }

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) { root.classList.add('anim-off'); return; }

  var tagged = [];

  // Marca los elementos de un selector como "reveal" con retraso escalonado.
  function reveal(sel, opts) {
    opts = opts || {};
    var base = opts.base || 0, step = opts.step || 0;
    document.querySelectorAll(sel).forEach(function (el, i) {
      if (el.hasAttribute('data-reveal')) return;
      el.setAttribute('data-reveal', '');
      if (opts.hero) el.setAttribute('data-hero', '');
      el.style.setProperty('--d', (base + i * step) + 'ms');
      if (opts.lift) el.classList.add('hv-lift');
      tagged.push(el);
    });
  }
  function lift(sel) {
    document.querySelectorAll(sel).forEach(function (el) { el.classList.add('hv-lift'); });
  }

  try {
    /* ===== ESCRITORIO (#vista-escritorio) ===== */
    // Hero: texto (escalonado) y después la imagen
    reveal('#inicio .grid.grid-cols-1 > div:first-child > *', { hero: true, base: 0, step: 90 });
    reveal('#inicio .grid.grid-cols-1 > div:last-child', { hero: true, base: 420 });
    // Sobre mí
    reveal('#sobre-mi > div > div:nth-child(-n+4)');
    reveal('#sobre-mi .w-full > h3');
    reveal('#sobre-mi .grid > div', { step: 100, lift: true });
    // Servicios
    reveal('#servicios > div > div:first-child');
    reveal('#servicios .grid > div', { step: 100, lift: true });
    reveal('#servicios > div > .mt-8');
    // Por qué elegirnos
    reveal('#por-que-elegirnos > div > div:first-child');
    reveal('#por-que-elegirnos .grid > div', { step: 100, lift: true });
    // Ubicación
    reveal('#ubicacion > div > div:first-child');
    reveal('#ubicacion .grid > div:first-child > div', { step: 100, lift: true });
    reveal('#ubicacion .grid > div:last-child', { base: 150 });
    lift('#ubicacion .grid > div:last-child > div');
    // Pie
    reveal('#vista-escritorio footer > div > .grid > div', { step: 100 });
    reveal('#vista-escritorio footer > div > div.mt-16');

    /* ===== MÓVIL (#vista-movil) ===== */
    // Hero: texto primero, después la imagen
    reveal('#m-inicio > div:nth-child(2)', { hero: true, base: 0 });
    reveal('#m-inicio > div:nth-child(3)', { hero: true, base: 90 });
    reveal('#m-inicio > div:nth-child(1)', { hero: true, base: 260 });
    // Compromiso
    reveal('#vista-movil main > div > section:first-of-type > div');
    // Servicios
    reveal('#m-servicios > div:first-child');
    reveal('#m-servicios > div.flex-col.gap-space-sm > div', { step: 100 });
    reveal('#m-servicios > div.pt-space-xs');
    // Tu tranquilidad
    reveal('#vista-movil main > div > section:nth-of-type(3) > div:first-child');
    reveal('#vista-movil main > div > section:nth-of-type(3) .grid > div', { step: 100 });
    // Horario y cómo llegar
    reveal('#m-horario > div:first-child');
    reveal('#m-horario > div:last-child', { base: 80 });
    // Contacto y pie
    reveal('#m-contacto');
    reveal('#vista-movil main > footer');

    /* ===== Botones de WhatsApp y botón flotante ===== */
    document.querySelectorAll('a[href*="wa.me"]').forEach(function (a) { a.classList.add('hv-btn'); });
    var fab = document.querySelector('a[aria-label="WhatsApp Flotante"]');
    if (fab) fab.classList.add('pulse-fab');

    /* ===== Activar ===== */
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        show(en.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -4% 0px' });

    var pending = tagged.slice();
    function show(el) {
      var i = pending.indexOf(el);
      if (i > -1) pending.splice(i, 1);
      if (el.classList.contains('is-in')) return;
      el.classList.add('is-in');
      var d = parseInt(el.style.getPropertyValue('--d'), 10) || 0;
      var dur = el.hasAttribute('data-hero') ? 800 : 700;
      setTimeout(function () { el.classList.add('is-done'); }, d + dur + 60);
    }

    root.classList.add('anim-on');
    void root.offsetHeight; // fija el estado oculto antes de observar
    tagged.forEach(function (el) { io.observe(el); });

    // Red de seguridad: al llegar al final de la página no queda nada oculto
    window.addEventListener('scroll', function () {
      if (pending.length && window.innerHeight + window.pageYOffset >= document.documentElement.scrollHeight - 4) {
        pending.slice().forEach(show);
      }
    }, { passive: true });
  } catch (err) {
    // Si algo falla, el contenido queda visible por completo
    root.classList.remove('anim-on');
    root.classList.add('anim-off');
  }
})();
