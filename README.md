# Cut Tracker

A personal cutting-adherence tracker. See [spec.md](./spec.md) for the full product and technical spec.

## Stack

React + Vite + TypeScript + Tailwind CSS, Supabase (Auth/Postgres/RLS), Recharts, deployed to Vercel as a PWA.

## Setup

1. Install dependencies:

   ```
   npm install
   ```

2. Create a Supabase project at [supabase.com](https://supabase.com).

3. Run the SQL in [supabase/migrations/0001_init.sql](./supabase/migrations/0001_init.sql) in the Supabase SQL Editor to create the schema, RLS policies, and constraints.

4. Copy `.env.example` to `.env` and fill in your Supabase project URL and anon key (Project Settings → API):

   ```
   cp .env.example .env
   ```

5. Enable Google as an Auth provider in Supabase (Authentication → Providers → Google), using a Google Cloud OAuth client. Until this is configured, sign-in will not work.

6. Start the dev server:

   ```
   npm run dev
   ```

## Environment variables

`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are required. `npm run build`
fails immediately if either is missing, including on Vercel — set them in the
project's environment settings before deploying.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — type-check and build for production
- `npm run lint` — run oxlint
- `npm run preview` — preview the production build locally
