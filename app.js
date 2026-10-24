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

  /* ---------- hero carousel ---------- */
  (function () {
    var root = document.getElementById('hero');
    if (!root) return;
    var slides = [].slice.call(root.querySelectorAll('.slide'));
    if (slides.length < 2) return;
    var dots = [].slice.call(root.querySelectorAll('.dots .dot'));
    var count = document.getElementById('slideCount');
    var bar = root.querySelector('.sbar i');
    var i = 0, timer = null, raf = null, started = 0;
    var HOLD = 7000;

    function render() {
      slides.forEach(function (s, n) {
        var on = n === i;
        s.classList.toggle('is-active', on);
        if (on) s.removeAttribute('aria-hidden'); else s.setAttribute('aria-hidden', 'true');
      });
      dots.forEach(function (d, n) {
        d.classList.toggle('on', n === i);
        d.setAttribute('aria-selected', n === i ? 'true' : 'false');
        d.tabIndex = n === i ? 0 : -1;
      });
      if (count) count.innerHTML = ('0' + (i + 1)).slice(-2) + ' <i>/</i> ' + ('0' + slides.length).slice(-2);
    }
    function go(n, user) {
      i = (n + slides.length) % slides.length;
      render();
      if (user) stop(); else restart();
    }
    function tick(ts) {
      if (!started) started = ts;
      var p = Math.min(1, (ts - started) / HOLD);
      if (bar) bar.style.width = (p * 100) + '%';
      if (p >= 1) { started = 0; go(i + 1); }
      else raf = requestAnimationFrame(tick);
    }
    function restart() {
      cancelAnimationFrame(raf); started = 0;
      if (bar) bar.style.width = '0%';
      if (reduce) return;
      raf = requestAnimationFrame(tick);
    }
    function stop() {
      cancelAnimationFrame(raf); started = 0;
      if (bar) bar.style.width = '0%';
    }

    root.querySelectorAll('[data-dir]').forEach(function (b) {
      b.addEventListener('click', function () { go(i + (+b.getAttribute('data-dir')), true); });
    });
    dots.forEach(function (d) {
      d.addEventListener('click', function () { go(+d.getAttribute('data-go'), true); });
      d.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') { e.preventDefault(); go(i + 1, true); dots[i].focus(); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); go(i - 1, true); dots[i].focus(); }
      });
    });
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', function () { restart(); });
    root.addEventListener('focusin', stop);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else restart();
    });

    // touch / pointer swipe
    var x0 = null, y0 = null;
    root.addEventListener('touchstart', function (e) {
      x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; stop();
    }, { passive: true });
    root.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(i + (dx < 0 ? 1 : -1), true);
      x0 = y0 = null;
    });

    render();
    restart();
  })();

  /* ---------- capability carousel ---------- */
  [].slice.call(document.querySelectorAll('.carousel')).forEach(function (car) {
    var track = car.querySelector('.track');
    var bar = car.querySelector('.cbar i');
    var prev = car.querySelector('[data-cdir="-1"]');
    var next = car.querySelector('[data-cdir="1"]');
    if (!track) return;

    function step() {
      var card = track.firstElementChild;
      return card ? card.getBoundingClientRect().width + 18 : 320;
    }
    function sync() {
      var max = track.scrollWidth - track.clientWidth;
      var p = max > 2 ? track.scrollLeft / max : 0;
      if (bar) {
        var w = Math.max(14, (track.clientWidth / track.scrollWidth) * 100);
        bar.style.width = w + '%';
        bar.style.transform = 'translateX(' + (p * ((100 - w) / w) * 100) + '%)';
      }
      if (prev) prev.disabled = track.scrollLeft < 4;
      if (next) next.disabled = track.scrollLeft > max - 4;
    }
    if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: reduce ? 'auto' : 'smooth' }); });
    if (next) next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: reduce ? 'auto' : 'smooth' }); });
    track.addEventListener('scroll', function () { window.requestAnimationFrame(sync); }, { passive: true });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); track.scrollBy({ left: step(), behavior: 'smooth' }); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); track.scrollBy({ left: -step(), behavior: 'smooth' }); }
    });

    // drag to scroll (mouse)
    var down = false, sx = 0, sl = 0, moved = 0;
    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch') return;
      down = true; moved = 0; sx = e.clientX; sl = track.scrollLeft;
      track.classList.add('dragging');
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx;
      moved = Math.max(moved, Math.abs(dx));
      track.scrollLeft = sl - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!down) return;
      down = false; track.classList.remove('dragging');
    });
    track.addEventListener('click', function (e) { if (moved > 6) e.preventDefault(); }, true);

    sync();
    window.addEventListener('resize', sync);
  });

  /* ---------- counters ---------- */
  (function () {
    var nums = [].slice.call(document.querySelectorAll('.cnum[data-count]'));
    if (!nums.length) return;
    function run(el) {
      var target = parseFloat(el.getAttribute('data-count')) || 0;
      if (reduce || !('requestAnimationFrame' in window)) { el.textContent = target; return; }
      var t0 = null, dur = 1100;
      function frame(ts) {
        if (!t0) t0 = ts;
        var p = Math.min(1, (ts - t0) / dur);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased);
        if (p < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }
    if (!('IntersectionObserver' in window)) { nums.forEach(run); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        run(e.target); io.unobserve(e.target);
      });
    }, { threshold: 0.4 });
    nums.forEach(function (n) { io.observe(n); });
  })();

  /* ---------- parallax (GSAP where available) ---------- */
  (function () {
    if (reduce) return;
    var g = window.gsap, st = window.ScrollTrigger;
    if (g && st) {
      g.registerPlugin(st);
      var vis = document.querySelector('.slide.is-active .visual');
      if (vis) {
        g.to('.hero .visual', {
          yPercent: -9, ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 }
        });
      }
      g.utils.toArray('.aura b').forEach(function (b, n) {
        g.to(b, {
          yPercent: 12 + n * 7, ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 }
        });
      });
      return;
    }
    // lightweight fallback
    var hero = document.querySelector('.hero');
    if (!hero) return;
    var visuals = [].slice.call(document.querySelectorAll('.hero .visual'));
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        var y = Math.min(window.scrollY, hero.offsetHeight);
        visuals.forEach(function (v) { v.style.transform = 'translate3d(0,' + (-y * 0.06) + 'px,0)'; });
        ticking = false;
      });
    }, { passive: true });
  })();
})();
