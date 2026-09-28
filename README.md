# Neem Studio — sample site

Front-end structure and design system follow **`samahmed18156/unalome-beauty`**
(Playfair Display + Poppins, gold `#C9A55A` gradient, white cards on `#F8F6F3`, centred
section headers with `gradient-text`, tilt-on-hover cards, emoji/icon boxes). Same file
layout as that project, so the two sites stay easy to maintain side by side.

```
index.html        27 KB   markup
css/style.css     26 KB   all styling, one :root block
js/script.js       9 KB   nav, reveal, tilt, live hours, booking form
```

## Open it
Two options:
1. Double-click `index.html` — works directly, including the live open/closed pill.
2. `python3 -m http.server 5173` in this folder, then `http://localhost:5173`.

Needs internet only for the two Google Fonts files and the outbound links
(`tel:`, `wa.me`, Google Maps, Instagram). No images to host, no CDN library, no build step.

## Deliberately *not* copied from the Unalome project
Those four things were rejected on this site already, so they stay out — add them back only
if you want them on both sites:
- custom cursor follower (`.cursor-dot` / `.cursor-outline`)
- full-screen loading screen
- the JS-generated hero particles (I kept the three soft blurred `hero-shape` blobs instead —
  that *is* the Unalome hero background)
- the Font Awesome CDN stylesheet (emoji + inline glyphs replace it, so nothing external loads)

No WebGL either: the 3D orb that was here earlier is gone for good. The only "3D" left is the
`perspective()` tilt on the service/location/info cards, exactly like the reference project.

## Where the facts live
Everything was read off the public Google listing and the studio's existing booking menu:
4.5★/136 Google, 4.7★/483 Fresha, 219 Imam Haron Rd Claremont 7780, plus code 2F8J+HP,
062 171 0836, @neem_studio_, Mon–Fri 09:30–18:00, Sat 09:00–17:00, Sun closed, women-owned,
on-site parking, gender-neutral toilets, cards accepted, appointment required, on-site services
and delivery. Prices used verbatim: R150 neem massage (from), R425 silicone gliding cupping,
R80 facial cupping, R120 back scrub, R99 reflexology, R100/R170/R200 kids', R549 bundle.
Where nothing is published it says **Enquire** — no invented numbers anywhere. The footer carries
a visible "sample layout — prepared for approval, not yet published by the studio" flag.

## Two lines to edit per client
```
js/script.js   var HOURS = { 1:[9.5,18], … 0:null };   /* Mon–Sun, 24h decimals, null = closed */
               var STUDIO_WA = '27621710836';           /* +27 number, digits only, for the form */
```
Those drive the hours table, the "Today" row, the open/closed pill and the booking form.

## The booking form
No backend by design: on submit it validates name + phone, then opens
`https://wa.me/…?text=…` with the message already written, so the studio receives a real
WhatsApp instead of a lost email. Swap that one `window.open` for a Formspree or Getform
endpoint when a form should post for real.

## Publishing (same as unalome-beauty)
Drop the three files/folders into the repo root keeping `css/` and `js/`, then
Settings → Pages → Deploy from branch → `master` / root. Vercel also works: import the repo,
no build command, output dir empty — that is what `unalome-beauty.vercel.app` uses.
