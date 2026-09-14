(function () {
  'use strict';

  window.__nwReady = true;

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function makeTabs(container, branches, onPick) {
    return branches.map(function (branch, k) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'st-tab';
      btn.setAttribute('role', 'tab');
      btn.textContent = branch.label;
      var bar = document.createElement('span');
      bar.className = 'st-tabbar';
      btn.appendChild(bar);
      btn.addEventListener('click', function () { onPick(k); });
      container.appendChild(btn);
      return btn;
    });
  }

  function setActiveTab(tabs, k) {
    tabs.forEach(function (tab, n) {
      tab.classList.toggle('is-active', n === k);
      tab.setAttribute('aria-selected', String(n === k));
    });
  }

  // Hero: Etikett entsteht und landet auf dem Produkt
  function initLabelStage(root) {
    var branches = [
      { key: 'chem', label: 'Chemie', caption: 'Chemie · GHS-Etikett aus Folie – für Fässer und Kanister' },
      { key: 'food', label: 'Fleisch & Wurst', caption: 'Fleisch- & Wurstwaren · haftet auf fettigen, feuchten Oberflächen um 0 °C' },
      { key: 'wine', label: 'Wein', caption: 'Wein · haftet auf feuchten, kühlen Flaschen – mit Gold- und Silberfolien' },
      { key: 'garden', label: 'Gartenbau', caption: 'Gartenbau · witterungs- und UV-beständig – für Baumschulen und Gärtnereien' },
      { key: 'tire', label: 'Reifen', caption: 'Reifen · extra starke Klebkraft, Schutz gegen Weichmacher' }
    ];
    var layers = Array.prototype.slice.call(root.querySelectorAll('[data-layer]'));
    var caption = root.querySelector('.ls-caption');
    var current = -1;
    var timer;

    var tabs = makeTabs(root.querySelector('.st-tabs'), branches, function (k) {
      if (k === current) return;
      show(k);
      start();
    });

    function show(k) {
      current = k;
      // SVG-Elemente kennen die .hidden-Eigenschaft nicht – daher das Attribut setzen
      layers.forEach(function (layer) { layer.toggleAttribute('hidden', layer.getAttribute('data-layer') !== branches[k].key); });
      setActiveTab(tabs, k);
      caption.textContent = branches[k].caption;
      if (root.getAnimations) {
        root.getAnimations({ subtree: true }).forEach(function (a) { a.cancel(); a.play(); });
      }
    }

    function start() {
      clearInterval(timer);
      if (reducedMotion) return;
      timer = setInterval(function () { show((current + 1) % branches.length); }, 7600);
    }

    show(0);
    start();
  }

  // Druckmaschine: Materialbahn läuft durch alle Stationen
  function initPressStage(root) {
    var branches = [
      { key: 'chem', label: 'Chemie', caption: 'GHS-Gefahrstoffetiketten', inks: ['#d7141f', '#273581', '#11222d', '#53627e'] },
      { key: 'food', label: 'Fleisch & Wurst', caption: 'Etiketten für Fleisch- und Wurstwaren', inks: ['#77C8D2', '#273581', '#11222d', '#53627e'] },
      { key: 'wine', label: 'Wein', caption: 'Weinetiketten', inks: ['#b59f6e', '#273581', '#11222d', '#8a8f99'] },
      { key: 'garden', label: 'Gartenbau', caption: 'Schlaufenetiketten für Gärtnereien', inks: ['#7ea86b', '#8c78c8', '#11222d', '#273581'] },
      { key: 'tire', label: 'Reifen', caption: 'Reifenetiketten', inks: ['#77C8D2', '#273581', '#11222d', '#53627e'] }
    ];
    var zones = Array.prototype.slice.call(root.querySelectorAll('[data-zone]'));
    var inks = Array.prototype.slice.call(root.querySelectorAll('[data-ink]'));
    var caption = root.querySelector('.st-caption');
    var current = -1;
    var timer;

    var tabs = makeTabs(root.querySelector('.st-tabs'), branches, function (k) {
      if (k === current) return;
      show(k);
      start();
    });

    function show(k) {
      current = k;
      var branch = branches[k];
      zones.forEach(function (zone) {
        zone.setAttribute('fill', 'url(#pr-' + branch.key + '-' + zone.getAttribute('data-zone') + ')');
      });
      inks.forEach(function (el) {
        el.setAttribute('fill', branch.inks[Number(el.getAttribute('data-ink')) - 1]);
      });
      setActiveTab(tabs, k);
      caption.textContent = branch.caption;
    }

    function start() {
      clearInterval(timer);
      if (reducedMotion) return;
      timer = setInterval(function () { show((current + 1) % branches.length); }, 9600);
    }

    show(0);
    start();
  }

  function initMenu() {
    var burger = document.querySelector('.burger');
    var nav = document.getElementById('mobile-nav');
    if (!burger || !nav) return;

    function setOpen(open) {
      nav.hidden = !open;
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
    }

    burger.addEventListener('click', function () { setOpen(nav.hidden); });
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { setOpen(false); });
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1100) setOpen(false);
    });
  }

  function initTimeline() {
    var timelines = document.querySelectorAll('.timeline');
    if (!('IntersectionObserver' in window)) {
      timelines.forEach(function (el) { el.classList.add('in-view'); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    timelines.forEach(function (el) { observer.observe(el); });
  }

  // Unterseiten: dezente Scroll-Effekte
  function initReveal() {
    var els = document.querySelectorAll('.reveal, .stagger, .htl, .layers, .zoom-in');
    if (!els.length) return;
    if (reducedMotion || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('in-view'); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { observer.observe(el); });
  }

  function initCountUp() {
    var els = document.querySelectorAll('[data-count]');
    if (!els.length || reducedMotion || !('IntersectionObserver' in window)) return;

    function format(el, value) {
      var text = el.hasAttribute('data-plain') ? String(value) : value.toLocaleString('de-DE');
      el.textContent = text + (el.getAttribute('data-suffix') || '');
    }

    function run(el) {
      var to = Number(el.getAttribute('data-count'));
      var from = Number(el.getAttribute('data-from') || 0);
      var start = null;
      function step(ts) {
        if (start === null) start = ts;
        var t = Math.min(1, (ts - start) / 1400);
        var eased = 1 - Math.pow(1 - t, 3);
        format(el, Math.round(from + (to - from) * eased));
        if (t < 1) requestAnimationFrame(step);
      }
      format(el, from);
      requestAnimationFrame(step);
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          run(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    els.forEach(function (el) { observer.observe(el); });
  }

  function initSubnav() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.subnav-links a[href^="#"]'));
    if (!links.length || !('IntersectionObserver' in window)) return;
    var byId = {};
    links.forEach(function (link) { byId[link.getAttribute('href').slice(1)] = link; });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (link) { link.classList.remove('is-active'); });
        var active = byId[entry.target.id];
        if (active) {
          active.classList.add('is-active');
          var bar = active.parentNode;
          if (bar.scrollWidth > bar.clientWidth) {
            bar.scrollTo({ left: Math.max(0, active.offsetLeft - 20), behavior: 'auto' });
          }
        }
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    Object.keys(byId).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  }

  function initSeal() {
    var el = document.querySelector('[data-peel]');
    if (!el || reducedMotion) return;
    function update() {
      var p = Math.min(1, Math.max(0, window.scrollY / 420));
      el.style.setProperty('--peel', (0.25 + 0.75 * p).toFixed(3));
    }
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  function initCycle() {
    var el = document.querySelector('[data-cycle]');
    if (!el) return;
    var steps = el.querySelectorAll('li');
    function update() {
      var rect = el.getBoundingClientRect();
      var vh = window.innerHeight;
      var p = Math.min(1, Math.max(0, (vh * 0.85 - rect.top) / (rect.height + vh * 0.35)));
      var lit = reducedMotion ? steps.length : Math.ceil(p * steps.length);
      steps.forEach(function (step, i) { step.classList.toggle('is-lit', i < lit); });
      el.style.setProperty('--progress', lit <= 1 ? 0 : (lit - 1) / (steps.length - 1));
    }
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
  }

  function initTeamFilter() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
    if (!buttons.length) return;
    var cards = document.querySelectorAll('[data-dept]');
    var groups = document.querySelectorAll('.team-group');
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var filter = button.getAttribute('data-filter');
        buttons.forEach(function (b) {
          b.classList.toggle('is-active', b === button);
          b.setAttribute('aria-pressed', String(b === button));
        });
        cards.forEach(function (card) {
          card.hidden = filter !== 'alle' && card.getAttribute('data-dept') !== filter;
        });
        groups.forEach(function (group) {
          group.hidden = !group.querySelector('[data-dept]:not([hidden])');
        });
      });
    });
  }

  function initPreviewForm() {
    var form = document.querySelector('[data-preview-form]');
    if (!form) return;
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      form.querySelector('.form-status').textContent = 'Vorschau: Das Formular ist noch nicht angebunden. Bitte rufen Sie an oder schreiben Sie an info@nordwind-etiketten.de.';
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var labelStage = document.querySelector('[data-label-stage]');
    var pressStage = document.querySelector('[data-press-stage]');
    if (labelStage) initLabelStage(labelStage);
    if (pressStage) initPressStage(pressStage);
    initMenu();
    initTimeline();
    initReveal();
    initCountUp();
    initSubnav();
    initSeal();
    initCycle();
    initTeamFilter();
    initPreviewForm();
    var year = document.querySelector('[data-year]');
    if (year) year.textContent = String(new Date().getFullYear());
  });
})();
