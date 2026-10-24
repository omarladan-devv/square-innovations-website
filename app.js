(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- mobile menu ---------- */
  var burger = document.getElementById('burger'), mob = document.getElementById('mob');
  if (burger && mob) {
    burger.addEventListener('click', function () {
      var open = mob.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* ---------- sticky header shadow ---------- */
  var nav = document.getElementById('nav');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('stuck', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- reveal on scroll ---------- */
  var items = [].slice.call(document.querySelectorAll('.rv'));
  if (!items.length) { /* nothing */ }
  else if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var sibs = el.parentElement ? [].slice.call(el.parentElement.children).filter(function (c) {
          return c.classList && c.classList.contains('rv');
        }) : [];
        var i = sibs.indexOf(el);
        el.style.transitionDelay = (i > 0 ? Math.min(i, 6) * 70 : 0) + 'ms';
        el.classList.add('in');
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0 });
    items.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < (window.innerHeight || 800)) el.classList.add('in');
      else io.observe(el);
    });
    // backstop: anything that ends up on screen is revealed, even if the
    // observer misses it (fast scrolling, deep links, restored positions)
    var sweeping = false;
    var sweep = function () {
      sweeping = false;
      var vh = window.innerHeight || 800;
      for (var i = items.length - 1; i >= 0; i--) {
        var el = items[i];
        if (el.classList.contains('in')) { items.splice(i, 1); continue; }
        var r = el.getBoundingClientRect();
        if (r.top < vh && r.bottom > 0) { el.classList.add('in'); io.unobserve(el); items.splice(i, 1); }
      }
    };
    var queue = function () {
      if (sweeping) return;
      sweeping = true;
      window.requestAnimationFrame(sweep);
    };
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    window.addEventListener('load', queue);
    setTimeout(queue, 400);
  }

  /* ---------- generic roving tablist ---------- */
  function tablist(container, onSelect) {
    if (!container) return;
    var tabs = [].slice.call(container.querySelectorAll('[role="tab"]'));
    if (!tabs.length) return;
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
      });
      if (focus) tab.focus();
      onSelect(tab);
    }
    tabs.forEach(function (t) {
      t.addEventListener('click', function () { select(t, false); });
      t.addEventListener('mouseenter', function () { if (!reduce) select(t, false); });
      t.addEventListener('keydown', function (e) {
        var i = tabs.indexOf(t), n = null;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
        else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === 'Home') n = tabs[0];
        else if (e.key === 'End') n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); select(n, true); }
      });
    });
  }

  function flash(el) {
    if (reduce || !el) return;
    el.classList.remove('fade');
    void el.offsetWidth;
    el.classList.add('fade');
  }

  /* ---------- architecture layers ---------- */
  var note = document.getElementById('sysnote');
  if (note) {
    var p = note.querySelector('p');
    tablist(document.querySelector('.layers'), function (tab) {
      p.innerHTML = '<strong>' + tab.getAttribute('data-h') + '</strong>' + tab.getAttribute('data-x');
      flash(note);
    });
  }

  /* ---------- process steps ---------- */
  var panel = document.getElementById('procpanel');
  if (panel) {
    tablist(document.querySelector('.steps'), function (tab) {
      var tags = (tab.getAttribute('data-tags') || '').split('|')
        .map(function (t) { return '<li>' + t + '</li>'; }).join('');
      panel.innerHTML = '<span class="lab">' + tab.getAttribute('data-lab') + '</span>'
        + '<h3>' + tab.getAttribute('data-t') + '</h3>'
        + '<p>' + tab.getAttribute('data-d') + '</p><ul>' + tags + '</ul>';
      flash(panel);
    });
  }

  /* ---------- industry selector ---------- */
  var sel = document.getElementById('selpanel');
  if (sel) {
    var tileSrc = sel.querySelector('.tile');
    var tileHTML = tileSrc ? tileSrc.outerHTML : '';
    tablist(document.querySelector('.sel-list'), function (tab) {
      var tags = (tab.getAttribute('data-tags') || '').split('|')
        .map(function (t) { return '<li>' + t + '</li>'; }).join('');
      var icon = window.SI_ICONS && window.SI_ICONS[tab.getAttribute('data-k')];
      sel.innerHTML = '<div class="top">' + (icon || tileHTML) + '<h3>' + tab.getAttribute('data-n') + '</h3></div>'
        + '<div class="bd"><p>' + tab.getAttribute('data-d') + '</p>'
        + '<ul class="tags">' + tags + '</ul></div>';
      flash(sel);
    });
  }

  /* ---------- copy helpers ---------- */
  function copy(btn, text) {
    var label = btn.getAttribute('data-label') || btn.textContent;
    btn.setAttribute('data-label', label);
    var done = function () {
      btn.textContent = 'Copied';
      setTimeout(function () { btn.textContent = label; }, 1800);
    };
    var manual = function () {
      var ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); }
      catch (e) { btn.textContent = 'Copy manually'; }
      document.body.removeChild(ta);
    };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, manual);
      } else { manual(); }
    } catch (e) { manual(); }
  }
  var mail = document.getElementById('copymail');
  if (mail) mail.addEventListener('click', function () { copy(mail, 'contact@squareinnovationsllc.com'); });

  /* ---------- enquiry form ---------- */
  var disclose = document.getElementById('disclose'), more = document.getElementById('more');
  if (disclose && more) {
    disclose.addEventListener('click', function () {
      var open = more.hidden;
      more.hidden = !open;
      disclose.setAttribute('aria-expanded', open ? 'true' : 'false');
      disclose.firstElementChild.textContent = open ? '−' : '+';
    });
  }

  var form = document.getElementById('enq'), ok = document.getElementById('ok'), payload = '';
  if (form) {
    var val = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = false;
      ['f-name', 'f-email', 'f-desc'].forEach(function (id) {
        var el = document.getElementById(id);
        if (!el.value.trim()) { el.classList.add('bad'); bad = true; } else { el.classList.remove('bad'); }
      });
      var em = document.getElementById('f-email');
      if (em.value.trim() && em.value.indexOf('@') < 1) { em.classList.add('bad'); bad = true; }
      if (bad) { form.querySelector('.bad').focus(); return; }
      payload = 'Project enquiry — Square Innovations International\n\n'
        + 'Full name: ' + val('f-name') + '\n'
        + 'Business email: ' + val('f-email') + '\n'
        + 'Organization: ' + (val('f-org') || '—') + '\n'
        + 'Phone number: ' + (val('f-phone') || '—') + '\n'
        + 'Area of interest: ' + (val('f-area') || '—') + '\n\n'
        + 'What they want to build or solve:\n' + val('f-desc') + '\n';
      form.hidden = true; ok.hidden = false;
      ok.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
    });
    var enqBtn = document.getElementById('copyenq');
    if (enqBtn) enqBtn.addEventListener('click', function () { copy(enqBtn, payload); });
    var again = document.getElementById('again');
    if (again) again.addEventListener('click', function () { ok.hidden = true; form.hidden = false; });
  }
})();
