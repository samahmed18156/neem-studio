/* ============================================================
   NEEM STUDIO — interaction layer
   Patterns (sticky header, mobile nav, reveal-on-scroll, vanilla
   3D tilt) follow samahmed18156/unalome-beauty/js/script.js.
   The open/closed logic and hours table are driven by one HOURS
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
            return { day: map[get('weekday')], mins: (+get('hour')) * 60 + (+get('minute')) };
        } catch (e) {
            var d = new Date();
            return { day: d.getDay(), mins: d.getHours() * 60 + d.getMinutes() };
        }
    }

    /* ---------- hours table + open strip ---------- */
    function renderHours() {
        var table = document.getElementById('hoursTable');
        if (!table) { return; }
        var now = joburgNow(), html = '', open = false, status = '';

        for (var i = 1; i <= 7; i++) {
            var idx = i % 7, t = HOURS[idx], isToday = idx === now.day;
            var time = t ? hhmm(t[0]) + ' – ' + hhmm(t[1]) : 'Closed';
            var cls = 'hours-row' + (isToday ? ' today' : '');
            var badge = isToday ? '<span class="badge">Today</span>' : '';
            html += '<div class="' + cls + '"><span class="day">' + DAYS[idx] + '</span>' + badge +
                '<span class="dots"></span><span class="time' + (t ? '' : ' closed') + '">' + time + '</span></div>';
        }
        table.innerHTML = html;

        var t0 = HOURS[now.day];
        if (t0) {
            if (now.mins < t0[0] * 60) {
                status = 'Opens today at ' + hhmm(t0[0]);
            } else if (now.mins < t0[1] * 60) {
                open = true;
                status = (now.mins > t0[1] * 60 - 60 ? 'Closing soon · ' : 'Open now · ') + 'until ' + hhmm(t0[1]);
            } else {
                status = 'Closed for today';
            }
        } else {
            status = 'Closed today';
        }
        if (!open) {
            for (var b = 1; b <= 6 && status.indexOf('Opens') !== 0; b++) {
                var nx = (now.day + b) % 7;
                if (HOURS[nx]) {
                    status = (b === 1 ? 'Opens tomorrow ' : 'Opens ' + DAYS[nx] + ' ') + hhmm(HOURS[nx][0]);
                }
            }
        }

        var pill = document.getElementById('openPill');
        if (pill) {
            pill.textContent = status;
            pill.className = 'pill' + (open ? '' : ' closed');
        }
        var line = document.getElementById('todayLine');
        if (line) {
            line.textContent = 'Today (' + DAYS[now.day] + ') · ' + (t0 ? hhmm(t0[0]) + '–' + hhmm(t0[1]) : 'closed');
        }
    }

    /* ---------- header state + mobile nav ---------- */
    function initNav() {
        var header = document.querySelector('.site-header');
        var burger = document.getElementById('hamburger');
        var links = document.querySelector('.nav-links');
        if (!header || !burger || !links) { return; }

        var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 24); };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();

        burger.addEventListener('click', function () {
            var open = links.classList.toggle('open');
            burger.classList.toggle('open', open);
            burger.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
        Array.prototype.forEach.call(links.querySelectorAll('a'), function (a) {
            a.addEventListener('click', function () {
                links.classList.remove('open');
                burger.classList.remove('open');
                burger.setAttribute('aria-expanded', 'false');
            });
        });
    }

    /* ---------- reveal on scroll ---------- */
    function initReveal() {
        var targets = document.querySelectorAll(
            '.section-header, .feature, .service-card, .menu-row, .gallery-item, ' +
            '.image-card, .about-content, .hours-table, .location-card, .info-card, ' +
            '.contact-form-container, .menu-note'
        );
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

    /* ---------- vanilla 3D tilt on cards ---------- */
    function initTilt() {
        if (!FINE || RM) { return; }
        var nodes = document.querySelectorAll('[data-tilt]');
        Array.prototype.forEach.call(nodes, function (el) {
            var max = el.classList.contains('service-card') ? 7 : 5;
            el.addEventListener('pointermove', function (ev) {
                var r = el.getBoundingClientRect();
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
        var STUDIO_WA = '27621710836'; /* +27 62 171 0836 */

        form.addEventListener('submit', function (ev) {
            ev.preventDefault();
            var name = form.name.value.trim();
            var phone = form.phone.value.trim();
            var bad = false;

            [form.name, form.phone].forEach(function (f) {
                var ok = f.value.trim().length >= (f === form.phone ? 9 : 2);
                f.classList.toggle('invalid', !ok);
                if (!ok) { bad = true; }
            });
            if (bad) {
                note('Please add your name and a phone number so the studio can confirm.', false);
                return;
            }

            var msg = 'Hello Neem Studio, I would like to book.\n\n' +
                'Name: ' + name + '\n' +
                'Phone: ' + phone + '\n' +
                'Treatment: ' + (form.service.value || 'not sure yet — please advise') + '\n' +
                'Preferred time: ' + (form.when.value.trim() || 'flexible') + '\n' +
                (form.message.value.trim() ? 'Notes: ' + form.message.value.trim() + '\n' : '') +
                '\nSent from the Neem Studio website.';

            window.open('https://wa.me/' + STUDIO_WA + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
            note('WhatsApp opened with your details filled in — press send there to confirm.', true);
        });

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
