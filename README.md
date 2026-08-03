# Hisaab — Personal Finance Tracker

## What this is (V1)
- Email/password login (Supabase Auth)
- Add income/expense transactions
- View transaction list, delete entries
- Dashboard summary (balance, income, expense) + category pie chart

## Setup checklist

### 1. Supabase (already done)
- Project created
- `supabase_setup.sql` run in SQL Editor (creates `transactions` table + security rules)

### 2. GitHub upload
Upload ALL files EXCEPT `.env` (it's git-ignored on purpose — never upload real secret keys to GitHub).

### 3. Netlify deploy
1. Go to netlify.com → **Add new site** → **Import an existing project**
2. Connect GitHub, select the `hisaab` repo
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Before deploying, go to **Site settings → Environment variables** and add:
   - `VITE_SUPABASE_URL` = (your Supabase project URL)
   - `VITE_SUPABASE_ANON_KEY` = (your Supabase anon key)
5. Click **Deploy**

### 4. Supabase Auth setting (important)
In Supabase Dashboard → Authentication → URL Configuration, add your Netlify URL
(e.g. `https://hisaab-xyz.netlify.app`) to **Site URL** and **Redirect URLs**,
otherwise login emails/redirects may not work correctly after deployment.

## Local testing (optional, needs Node.js)
```
npm install
npm run dev
```
