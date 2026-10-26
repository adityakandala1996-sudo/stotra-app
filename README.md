# Stotra Mala

Telugu / English stotra web app: stotras with per-verse meaning (Ardham), a Sankalpam generated from the user's country and today's panchangam, and a location-based Panchangam tab. Supabase provides login (email + password, no email verification) and stores each user's profile.

Plain static site with no build step: `index.html`, `css/`, `js/`, `vendor/`.

## Run locally

```bash
cd ~/stotra-app
python3 -m http.server 8765
# open http://localhost:8765
```

When `js/config.js` is empty, the app runs in **demo mode**: accounts are kept in the browser's localStorage only.

## Connect Supabase

1. Create a project at https://supabase.com (free tier is fine).
2. **SQL Editor** → paste and run `supabase/schema.sql` (creates `profiles` with row-level security).
3. **Authentication → Sign In / Providers → Email** → turn **off** "Confirm email". Users can then sign up and log in immediately, with no verification mail.
4. **Project Settings → API** → copy the Project URL and the `anon` public key into `js/config.js`.

## Content

- `js/data/stotras.js`: categories plus the built-in stotras, which are written in IAST with per-verse meanings in `en` and `te`. More built-in stotras live in `stotras-more.js`, and the pooja/karma procedures (Poorvangam, Sandhyavandanam, Yajnopavita Dharana, Satyanarayana Vratam) in `stotras-karma.js`. Verses can be step headings (`h`) or instruction notes (`note: {en, te}`).
- `js/data/library.js`: generated, so don't edit it by hand. These are stotras imported from Telugu and Sanskrit Wikisource (CC BY-SA 4.0) in Telugu script, without meanings. To regenerate:
  ```bash
  python3 -I tools/fetch_sa_wikisource.py      # Sanskrit Wikisource -> tools/.cache (slow, resumable)
  python3 -I tools/import_wikisource.py        # add --refresh to re-download Telugu Wikisource
  ```
  The importer cleans the wiki markup, converts Devanagari to Telugu, groups lines into verses, assigns a section by keyword, and skips anything already in the app.
- `js/translit.js`: IAST ↔ Telugu, Telugu → IAST for English mode, and English-spelled names → Telugu.
- `js/data/countries.js`: countries, cities (lat/lon/time zone) and the sankalpam dvipa for each region. Users can override the dvipa in Settings.
- `js/panchang.js`: tithi, nakshatra, yoga, karana, masa (amanta), samvatsara, ayana, ritu, sunrise/sunset, Rahu kalam, Yamagandam, Gulika and Abhijit. Calculated at local sunrise with the Lahiri ayanamsa, using astronomy-engine.
- `js/sankalpam.js`: the sankalpam template with its meanings.
- `supabase/migrations/`: the database schema (`npx supabase db push`).

## Deploying

The site is served by GitHub Pages from `main` at https://adityakandala1996-sudo.github.io/stotra-app/. Pushing to GitHub publishes it within a couple of minutes.
