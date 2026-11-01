/* Cartana v4. Short scroll-scrubbed line-art hero (index), nav, reveals, opening-email builder. Pages are complete HTML without it. */
(function () {
  'use strict';
  var d = document, root = d.documentElement, win = window;
  var reduce = win.matchMedia && win.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s, r) { return (r || d).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); }
  var top = $('.top'), menu = $('.menu');

  /* ---- mobile menu ---- */
  if (menu && top) {
    menu.addEventListener('click', function () {
      var o = top.classList.toggle('open');
      menu.setAttribute('aria-expanded', o);
      menu.textContent = o ? 'Close' : 'Menu';
    });
    $$('nav a', top).forEach(function (a) { a.addEventListener('click', function () { top.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); menu.textContent = 'Menu'; }); });
  }

  /* ---- short scroll scrub (index only): one scroll of about a screen plays the whole clip ---- */
  var track = $('.track');
  if (track) {
    var scene = $('.scene', track), video = $('video', scene);
    var vh, end, tTop, dur = 6.041667, cur = 0, target = 0, running = false;
    var clamp = function (x) { return x < 0 ? 0 : x > 1 ? 1 : x; };
    var lite = win.matchMedia('(max-width:900px)').matches || (navigator.connection && navigator.connection.saveData);
    var ease = function (x) { return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; };

    var measure = function () {
      vh = scene.offsetHeight;
      end = Math.max(1, track.offsetHeight - vh);
      tTop = track.getBoundingClientRect().top + win.pageYOffset;
    };
    var progress = function () {
      var p = clamp((win.pageYOffset - tTop) / end);
      root.classList.toggle('scrolled', p > 0.02);
      target = ease(p) * (dur - 1 / 48);
    };
    var step = function () {
      cur += (target - cur) * 0.22;
      if (Math.abs(target - cur) < 0.0005) cur = target;
      if (video && !video.seeking && Math.abs(cur - video.currentTime) > 1 / 60) video.currentTime = cur;
      if (cur !== target || (video && video.seeking)) requestAnimationFrame(step); else running = false;
    };
    var kick = function () { progress(); navTone(); if (!running && video && !reduce && !root.classList.contains('novideo')) { running = true; requestAnimationFrame(step); } };

    if (reduce || !video) {
      root.classList.add('still');
    } else {
      video.addEventListener('loadedmetadata', function () { if (video.duration) dur = video.duration; measure(); kick(); });
      video.addEventListener('seeked', function () { if (Math.abs(cur - video.currentTime) > 1 / 60 && !running) { running = true; requestAnimationFrame(step); } });
      video.addEventListener('error', function () { root.classList.add('novideo'); });
      video.src = lite ? 'assets/media/lineart-720.mp4' : 'assets/media/lineart-1080.mp4';
      video.load();
      /* iOS Safari will not seek a video until it has been played once from a gesture */
      var unlock = function () { var pr = video.play(); if (pr && pr.then) pr.then(function () { video.pause(); kick(); }).catch(function () {}); win.removeEventListener('touchstart', unlock); };
      win.addEventListener('touchstart', unlock, { passive: true });
    }
    measure();
    win.addEventListener('scroll', kick, { passive: true });
    win.addEventListener('resize', function () { measure(); kick(); });
    win.addEventListener('load', function () { measure(); kick(); });
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(function () { measure(); kick(); });
    kick();
  }

  /* ---- nav colour follows what is behind it ---- */
  function navTone() {
    if (!top) return;
    var y = 36, light = false;
    var secs = $$('[data-nav]');
    for (var i = 0; i < secs.length; i++) {
      var r = secs[i].getBoundingClientRect();
      if (r.top <= y && r.bottom > y) { light = secs[i].getAttribute('data-nav') === 'light'; }
    }
    top.classList.toggle('lt', light);
    top.classList.toggle('bg', light && win.pageYOffset > 8 && !(track && track.getBoundingClientRect().bottom > win.innerHeight));
  }
  if (!track) { win.addEventListener('scroll', navTone, { passive: true }); win.addEventListener('resize', navTone); navTone(); }

  /* ---- entrances on inner pages ---- */
  var rv = $$('.rv');
  if (rv.length && 'IntersectionObserver' in win && !reduce) {
    root.classList.add('js');
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    rv.forEach(function (el) { io.observe(el); });
    setTimeout(function () { rv.forEach(function (el) { el.classList.add('in'); }); }, 5000);
  }

  /* ---- opening-email builder: real content, mailto, no backend ---- */
  var form = $('#builder');
  if (form) {
    var PURCH = 'purchasing@cartanaco.com';
    var role = $$('input[name=role]', form), org = $('#b-org'), nm = $('#b-name'), auth = $('#b-auth');
    var subj = $('#m-subject'), body = $('#m-body'), send = $('#m-send');
    var boxes = $$('input[name=inc]', form);
    var build = function () {
      var dist = role.filter(function (r) { return r.checked; })[0].value === 'distributor';
      var who = (org.value || '').trim() || '[brand or company name]';
      var me = (nm.value || '').trim() || '[Your name]';
      var items = boxes.filter(function (b) { return b.checked; }).map(function (b) { return b.value; });
      var s = 'Opening order inquiry: ' + ((org.value || '').trim() || (dist ? 'distributor' : 'brand'));
      var lines = ['Hello Cartana purchasing team,', '',
        dist ? 'I am writing for ' + who + ', an authorized distributor. We would like to talk about an opening order.'
             : 'I am writing for ' + who + ', a brand. We would like to talk about an opening order.', ''];
      if (items.length) {
        lines.push('Included with this email:');
        items.forEach(function (i) { lines.push('- ' + i); });
      } else lines.push('I will send our price list, minimum order, MAP policy and product data shortly.');
      lines.push('', 'Please tell us what else you need to review an opening order.', '', 'Thank you,', me);
      var text = lines.join('\n');
      subj.textContent = 'Subject: ' + s;
      body.textContent = text;
      send.setAttribute('href', 'mailto:' + PURCH + '?subject=' + encodeURIComponent(s) + '&body=' + encodeURIComponent(text).replace(/%0A/g, '%0D%0A'));
    };
    role.forEach(function (r) {
      r.addEventListener('change', function () { if (r.checked) auth.checked = r.value === 'distributor'; build(); });
    });
    [org, nm].forEach(function (i) { i.addEventListener('input', build); });
    boxes.forEach(function (b) { b.addEventListener('change', build); });
    build();
  }
})();
