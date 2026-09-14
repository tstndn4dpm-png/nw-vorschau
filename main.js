(function () {
  'use strict';

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
      layers.forEach(function (layer) { layer.hidden = layer.getAttribute('data-layer') !== branches[k].key; });
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

  document.addEventListener('DOMContentLoaded', function () {
    var labelStage = document.querySelector('[data-label-stage]');
    var pressStage = document.querySelector('[data-press-stage]');
    if (labelStage) initLabelStage(labelStage);
    if (pressStage) initPressStage(pressStage);
    initMenu();
    initTimeline();
    var year = document.querySelector('[data-year]');
    if (year) year.textContent = String(new Date().getFullYear());
  });
})();
