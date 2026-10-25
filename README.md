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

## Hosting

Supabase can't serve this page as a website: Storage and Edge Functions return HTML as `text/plain`. Keep Supabase as the backend and host the static files on any free static host:

- **Netlify:** drag the `stotra-app` folder onto https://app.netlify.com/drop
- **Vercel:** `npx vercel deploy --prod` from this folder
- **GitHub Pages / Cloudflare Pages:** push the folder and enable Pages

Then add the site URL under Supabase **Authentication → URL Configuration → Site URL**.

## Content

- `js/data/stotras.js`: categories and stotras. Text is written once in IAST and rendered as Telugu script (`js/translit.js`) or as IAST / simple English. Each verse has `en` and `te` meanings. To add a stotra, append an object with `id`, `cat`, `iast`, `en`, `about`, `verses`.
- `js/data/countries.js`: countries, cities (lat/lon/time zone) and the sankalpam dvipa for each region. Outside India the dvipa varies by tradition; users can override it in Settings.
- `js/panchang.js`: tithi, nakshatra, yoga, karana, masa (amanta), samvatsara, ayana, ritu, sunrise/sunset, Rahu kalam, Yamagandam, Gulika and Abhijit. Calculated at local sunrise with the Lahiri ayanamsa, using astronomy-engine.
- `js/sankalpam.js`: the sankalpam template with its meanings.
