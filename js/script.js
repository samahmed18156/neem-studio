/* ============================================================
   NEEM STUDIO — interaction layer
   Patterns (sticky header, mobile nav, reveal-on-scroll, vanilla
   3D tilt) follow samahmed18156/unalome-beauty/js/script.js.
   Open/closed state and the hours table are driven by one HOURS
   object, so the listing stays honest in exactly one place.
   ============================================================ */
(function () {
    'use strict';

    var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var FINE = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    /* Mon–Sun in 24h decimals. null = closed. Source: Google listing. */
    var HOURS = { 1: [9.5, 18], 2: [9.5, 18], 3: [9.5, 18], 4: [9.5, 18], 5: [9.5, 18], 6: [9, 17], 0: null };
    var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    function two(n) { return (n < 10 ? '0' : '') + n; }
    function hhmm(dec) { return two(Math.floor(dec)) + ':' + two(Math.round((dec % 1) * 60)); }
    function byId(id) { return document.getElementById(id); }

    /* ---------- today in Cape Town, not the visitor's timezone ---------- */
    function joburgNow() {
        try {
            var parts = new Intl.DateTimeFormat('en-GB', {
                timeZone: 'Africa/Johannesburg', weekday: 'short', hour: '2-digit',
                minute: '2-digit', hour12: false
            }).formatToParts(new Date());
            var get = function (t) {
                for (var i = 0; i < parts.length; i++) { if (parts[i].type === t) { return parts[i].value; } }
                return '';
            };
            var map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
            var day = map[get('weekday')];
            var mins = (+get('hour')) * 60 + (+get('minute'));
            if (day === undefined || isNaN(mins)) { throw new Error('unparsed'); }
            return { day: day, mins: mins };
        } catch (e) {
            var d = new Date();
            return { day: d.getDay(), mins: d.getHours() * 60 + d.getMinutes() };
        }
    }

    /* ---------- hours table + open/closed strip ---------- */
    function renderHours() {
        var now = joburgNow();
        var table = byId('hoursTable');
        var pending = false;          /* true = we still have to say when it opens next */
        var open = false;
        var status = '';
        var today = HOURS[now.day];

        if (table) {
            var html = '';
            for (var i = 1; i <= 7; i++) {
                var idx = i % 7, t = HOURS[idx], isToday = idx === now.day;
                var time = t ? hhmm(t[0]) + ' – ' + hhmm(t[1]) : 'Closed';
                html += '<div class="hours-row' + (isToday ? ' today' : '') + '">' +
                    '<span class="day">' + DAYS[idx] + '</span>' +
                    (isToday ? '<span class="badge">Today</span>' : '') +
                    '<span class="dots"></span>' +
                    '<span class="time' + (t ? '' : ' closed') + '">' + time + '</span></div>';
            }
            table.innerHTML = html;
        }

        if (today) {
            var from = today[0] * 60, to = today[1] * 60;
            if (now.mins < from) {
                pending = true;
            } else if (now.mins < to) {
                open = true;
                status = (to - now.mins <= 60 ? 'Closing soon · until ' : 'Open now · until ') + hhmm(today[1]);
            } else {
                pending = true;
            }
        } else {
            status = 'Closed today';
            pending = true;
        }

        if (pending) {
            for (var b = 1; b <= 7; b++) {
                var nx = (now.day + b) % 7;
                if (HOURS[nx]) {
                    status = 'Opens ' + (b === 1 ? 'tomorrow' : DAYS[nx]) + ' at ' + hhmm(HOURS[nx][0]);
                    break;
                }
            }
        }

        var pill = byId('openPill');
        if (pill) {
            pill.textContent = status;
            pill.classList.toggle('closed', !open);
        }
        var line = byId('todayLine');
        if (line) {
            line.textContent = 'Today (' + DAYS[now.day] + ') · ' +
                (today ? hhmm(today[0]) + '–' + hhmm(today[1]) : 'closed');
        }
    }

    /* ---------- header state, mobile nav, active link ---------- */
    function initNav() {
        var header = document.querySelector('.site-header');
        var burger = byId('hamburger');
        var links = document.querySelector('.nav-links');
        if (!header || !burger || !links) { return; }

        var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 24); };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();

        var close = function () {
            links.classList.remove('open');
            burger.classList.remove('open');
            burger.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('nav-open');
        };
        var openMenu = function () {
            var isOpen = links.classList.toggle('open');
            burger.classList.toggle('open', isOpen);
            burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            document.body.classList.toggle('nav-open', isOpen);
        };
        burger.addEventListener('click', function () { links.classList.contains('open') ? close() : openMenu(); });
        Array.prototype.forEach.call(links.querySelectorAll('a'), function (a) { a.addEventListener('click', close); });
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { close(); } });
        /* never leave the sheet stuck open after a rotate / resize to desktop */
        window.addEventListener('resize', function () { if (window.innerWidth > 768) { close(); } });

        var anchors = Array.prototype.slice.call(links.querySelectorAll('a[href^="#"]'));
        var sections = anchors.map(function (a) {
            return document.querySelector(a.getAttribute('href'));
        }).filter(Boolean);
        if ('IntersectionObserver' in window && sections.length) {
            var spy = new IntersectionObserver(function (entries) {
                entries.forEach(function (en) {
                    if (!en.isIntersecting) { return; }
                    anchors.forEach(function (a) {
                        a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id);
                    });
                });
            }, { rootMargin: '-45% 0px -50% 0px' });
            sections.forEach(function (s) { spy.observe(s); });
        }
    }

    /* ---------- reveal on scroll ---------- */
    function initReveal() {
        var targets = document.querySelectorAll(
            '.section-header, .feature, .service-card, .menu-row, .gallery-item, ' +
            '.image-card, .about-content, .hours-table, .location-card, .info-card, ' +
            '.contact-form-container, .menu-note'
        );
        if (!targets.length) { return; }
        if (RM || !('IntersectionObserver' in window)) { return; }
        Array.prototype.forEach.call(targets, function (el, i) {
            el.setAttribute('data-reveal', '');
            el.style.transitionDelay = (i % 6) * 0.06 + 's';
        });
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (e.isIntersecting) { e.target.classList.add('revealed'); io.unobserve(e.target); }
            });
        }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
        Array.prototype.forEach.call(targets, function (el) { io.observe(el); });
    }

    /* ---------- vanilla 3D tilt on cards (pointer devices only) ---------- */
    function initTilt() {
        if (!FINE || RM) { return; }
        Array.prototype.forEach.call(document.querySelectorAll('[data-tilt]'), function (el) {
            var max = el.classList.contains('service-card') ? 7 : 5;
            el.addEventListener('pointermove', function (ev) {
                var r = el.getBoundingClientRect();
                if (!r.width || !r.height) { return; }
                var px = (ev.clientX - r.left) / r.width - 0.5;
                var py = (ev.clientY - r.top) / r.height - 0.5;
                el.style.transform = 'perspective(900px) rotateY(' + (px * max).toFixed(2) +
                    'deg) rotateX(' + (-py * max).toFixed(2) + 'deg) translateY(-4px)';
            });
            el.addEventListener('pointerleave', function () { el.style.transform = ''; });
        });
    }

    /* ---------- booking form -> WhatsApp ---------- */
    function initForm() {
        var form = document.getElementById('bookingForm');
        if (!form) { return; }
        var STUDIO_WA = '27621710836'; /* +27 62 171 0836, digits only */

        /* NB: read fields through elements[] — form.name is the form's own name
           attribute (an empty string), not the input, and would throw. */
        var f = form.elements;

        form.addEventListener('submit', function (ev) {
            ev.preventDefault();
            var name = (f.name.value || '').trim();
            var phone = (f.phone.value || '').trim();
            var bad = false;

            markInvalid(f.name, name.length < 2);
            markInvalid(f.phone, phone.replace(/\D/g, '').length < 9);
            bad = name.length < 2 || phone.replace(/\D/g, '').length < 9;
            if (bad) {
                note('Please add your name and a phone number so the studio can call you back.', false);
                (name.length < 2 ? f.name : f.phone).focus();
                return;
            }

            var msg = 'Hello Neem Studio, I would like to book.\n\n' +
                'Name: ' + name + '\n' +
                'Phone: ' + phone + '\n' +
                'Treatment: ' + (f.service.value || 'not sure yet, please advise') + '\n' +
                'Preferred time: ' + ((f.when.value || '').trim() || 'flexible') + '\n' +
                (((f.message.value || '').trim()) ? 'Notes: ' + f.message.value.trim() + '\n' : '') +
                '\nSent from the Neem Studio website.';

            var w = window.open('https://wa.me/' + STUDIO_WA + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
            if (w) {
                /* clear only the free-text fields: name and phone stay filled so a
                   second request is one keystroke away, and reset() is not relied on */
                f.message.value = '';
                f.when.value = '';
            }
            note(w
                ? 'WhatsApp opened with your details filled in. Press send there to confirm — we will reply to 062 171 0836.'
                : 'Your browser blocked the pop-up. Call or WhatsApp the studio on 062 171 0836 instead.', !!w);
        });

        Array.prototype.forEach.call(form.querySelectorAll('input, select, textarea'), function (el) {
            el.addEventListener('input', function () { el.classList.remove('invalid'); });
        });

        function markInvalid(el, on) { if (el && el.classList) { el.classList.toggle('invalid', !!on); } }
        function note(text, ok) {
            var n = document.getElementById('formNote');
            if (!n) { return; }
            n.textContent = text;
            n.classList.toggle('ok', !!ok);
        }
    }

    function boot() {
        renderHours();
        initNav();
        initReveal();
        initTilt();
        initForm();
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else { boot(); }
})();
