# CLARTAS

**The AI-powered e-commerce content factory.**

CLARTAS turns raw product photos and videos into sales-ready content: AI photo
editing, video generation, copywriting, brand management, digital asset
management, and e-commerce automation — in one platform, for global sellers.

It is built as a production-ready SaaS foundation (not a prototype): secure auth,
PostgreSQL with Row Level Security, a secure AI proxy, an AI credit system,
Paddle payments, transactional email, automation webhooks, localization in 4
languages, an admin area, and a Capacitor mobile wrapper.

---

## 1. Project overview

| | |
| --- | --- |
| Product | CLARTAS — AI SaaS / PaaS for visual commerce |
| Platforms | Desktop Web, Mobile Web, iOS, Android |
| Default language | English (also Indonesian, Mandarin Chinese, Spanish) |
| Architecture | Decoupled: Next.js UI · Supabase BaaS · server AI proxy · Paddle · Make.com/Resend · Capacitor |

## 2. Tech stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, next-intl, lucide-react
- **Mobile:** Capacitor (iOS + Android WebView shell)
- **Backend / BaaS:** Supabase Auth, PostgreSQL, Storage, Row Level Security
- **AI:** Fal.ai and/or Replicate, called only through secure server route handlers
- **Payments:** Paddle (Merchant of Record) — checkout, subscriptions, webhooks
- **Automation:** Make.com webhooks, Resend transactional email
- **Validation:** Zod · **Tests:** Vitest

## 3. Folder structure

```
clartas/
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── (auth)/         # sign-in, sign-up
│   │   │   ├── (app)/          # dashboard, editor, assets, ai-tools,
│   │   │   │                   # brand-kit, billing, settings, admin
│   │   │   ├── layout.tsx      # html/body + NextIntlClientProvider
│   │   │   └── page.tsx        # landing page
│   │   └── api/
│   │       ├── ai/             # 7 secure AI proxy routes
│   │       ├── upload/         # validated file upload → Supabase Storage
│   │       ├── paddle/webhook/ # signature-verified payment webhook
│   │       ├── resend/         # email trigger
│   │       └── make/           # automation trigger
│   ├── components/             # UI primitives, app shell, states, marketing
│   ├── features/               # auth, editor, ai, assets, billing, credits,
│   │                           # localization, workspace, brand-kit, admin, settings
│   ├── lib/                    # supabase, ai, paddle, resend, make, utils, env
│   ├── i18n/                   # routing.ts, request.ts, navigation.ts
│   └── middleware.ts           # next-intl locale middleware
├── messages/                   # en.json, id.json, zh.json, es.json
├── supabase/
│   ├── migrations/             # schema, RLS, storage, functions
│   └── policies/               # RLS documentation
├── mobile-shell/               # Capacitor offline shell
├── capacitor.config.ts
├── next.config.ts
└── .env.example
```

## 4. Installation guide

Prerequisites: Node.js 20+ and npm.

```bash
git clone https://github.com/kevinnkevinn/clartas.git
cd clartas
npm install
cp .env.example .env.local   # then fill in real values (see below)
npm run dev                  # http://localhost:3000  →  redirects to /en
```

Useful scripts:

```bash
npm run dev          # dev server
npm run build        # production web build
npm run start        # run the production build
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm run test         # Vitest unit tests
```

## 5. Environment variables

Copy `.env.example` to **`.env.local`** and add real values. `.env.local` is
git-ignored and must **never** be committed. Only `NEXT_PUBLIC_*` variables are
exposed to the browser/mobile client; everything else is a server-only secret.

| Variable | Scope | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | **secret** | Server-only privileged key (webhooks, credits, admin) |
| `FAL_KEY` | **secret** | Fal.ai API key |
| `REPLICATE_API_TOKEN` | **secret** | Replicate token |
| `PADDLE_API_KEY` | **secret** | Paddle API key |
| `PADDLE_WEBHOOK_SECRET` | **secret** | Verifies Paddle webhook signatures |
| `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` | public | Paddle.js client token |
| `NEXT_PUBLIC_PADDLE_ENV` | public | `sandbox` or `production` |
| `RESEND_API_KEY` | **secret** | Resend email key |
| `RESEND_FROM_EMAIL` | secret | Verified sender address |
| `MAKE_WEBHOOK_URL` | **secret** | Make.com scenario webhook |
| `NEXT_PUBLIC_APP_URL` | public | Deployed base URL (mobile calls this) |
| `ADMIN_EMAILS` | secret | Comma-separated admin allowlist |
| `CAP_SERVER_URL` | build | Mobile WebView target (deployed URL) |
| `NEXT_PUBLIC_PADDLE_PRICE_PREMIUM` / `_ENTERPRISE` | public | Paddle price ids for checkout |

> **Mock mode:** If `FAL_KEY` and `REPLICATE_API_TOKEN` are both empty, AI routes
> run in a safe simulated mode (clearly labeled in the UI) so you can test the
> full flow without external calls.

## 6. Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Copy the URL, anon key, and service role key into `.env.local`.
3. Apply the SQL in order via the SQL editor or the Supabase CLI:
   - `supabase/migrations/0001_initial_schema.sql` — tables, enums, triggers,
     and the new-user bootstrap (profile + workspace + free subscription + welcome credits)
   - `supabase/migrations/0002_rls_policies.sql` — Row Level Security
   - `supabase/migrations/0003_storage.sql` — private buckets + storage policies
   - `supabase/migrations/0004_functions.sql` — atomic credit RPCs
4. Buckets created: `raw-assets`, `processed-assets`, `brand-assets` (all private,
   accessed via signed URLs).

With the CLI:

```bash
supabase link --project-ref <ref>
supabase db push
```

## 7. Paddle setup

1. Create a Paddle (Billing) account and products/prices for Premium & Enterprise.
2. Put the price ids in `NEXT_PUBLIC_PADDLE_PRICE_PREMIUM` / `_ENTERPRISE`.
3. Set `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`, `PADDLE_API_KEY`, and `NEXT_PUBLIC_PADDLE_ENV`.
4. Add a webhook destination pointing to `https://<your-app>/api/paddle/webhook`
   and copy its secret into `PADDLE_WEBHOOK_SECRET`.
5. The webhook verifies the `Paddle-Signature` header, then updates
   `subscriptions` / `transactions`, grants monthly credits, and triggers an
   invoice email — all with the service role key, server-side only.

## 8. Fal.ai / Replicate setup

- Add `FAL_KEY` and/or `REPLICATE_API_TOKEN` to `.env.local`.
- All AI calls happen in `src/app/api/ai/*` via the shared pipeline in
  `src/lib/ai/handler.ts` (auth → validate → credit check → job row → provider →
  deduct credits). Keys are never sent to the client.
- Default model routing lives in `src/lib/ai/providers.ts`.

## 9. Resend setup

- Add `RESEND_API_KEY` and a verified `RESEND_FROM_EMAIL`.
- Templates: onboarding, payment confirmation, operational (`src/lib/resend/`).
- Without a key, emails are skipped and logged (safe for local dev).

## 10. Make.com webhook setup

- Create a scenario with a custom webhook trigger and put its URL in `MAKE_WEBHOOK_URL`.
- CLARTAS sends **lightweight JSON only** (ids, statuses, signed URLs) — never
  large files — per the blueprint. See `src/lib/make/client.ts`.

## 11. Localization guide

- Powered by **next-intl**. Default locale: **English**. Supported: `en`, `id`,
  `zh`, `es`. Routes are locale-prefixed, e.g. `/en/dashboard`, `/es/dashboard`.
- All user-facing copy lives in `messages/<locale>.json`.
- The visible **LanguageSwitcher** updates the URL locale and the `NEXT_LOCALE`
  cookie. To add a language: add the locale to `src/i18n/routing.ts` and create a
  matching `messages/<locale>.json`.

## 12. Web deployment guide (Vercel)

1. Push to GitHub and import the repo into Vercel.
2. Add all environment variables in the Vercel dashboard.
3. Deploy — the App Router server, API routes, and middleware run on Vercel.
4. Set `NEXT_PUBLIC_APP_URL` to your production domain.

## 13. Mobile build guide (Capacitor)

CLARTAS is a **full-stack** app with secure server routes (AI proxy, uploads,
Paddle webhooks). A pure static export **cannot** run that server-side logic, so
the mobile app must talk to the **deployed web backend**.

Recommended setup — native shell that loads the deployed app:

```bash
# 1. Deploy the web app first (e.g. Vercel) and note its URL.
# 2. Point Capacitor at it:
$env:CAP_SERVER_URL="https://app.clartas.com"   # PowerShell
npm i @capacitor/ios @capacitor/android
npx cap add ios
npx cap add android
npm run sync:mobile          # next build && npx cap sync
npm run open:ios             # or: npm run open:android
```

`capacitor.config.ts` reads `CAP_SERVER_URL` and loads it in the WebView. When it
is unset, the bundled `mobile-shell/` offline page is shown instead.

> An experimental fully-static export is available via `npm run build:static`
> (`BUILD_TARGET=mobile` → `output: 'export'`), but it omits API routes by design
> and is only suitable if you point the client at a separate backend.

## 14. GitHub push guide

```bash
git init
git add .
git commit -m "Build CLARTAS SaaS foundation"
git branch -M main
git remote add origin https://github.com/kevinnkevinn/clartas.git
git push -u origin main
```

Before pushing: confirm the app builds (`npm run build`), no secrets are present,
and `.env.local` is git-ignored.

## 15. Security notes

- **Row Level Security** on every user-data table; users reach only their own or
  their workspace's data. Billing/credit ledger writes are service-role only.
- **Server-side API keys** — AI/Paddle/Resend secrets never reach the client.
- **Input validation** with Zod on every AI route; **file type/size validation**
  on upload (images ≤ 10MB: JPEG/PNG/WebP; videos ≤ 100MB: MP4/MOV/WEBM).
- **Webhook signature verification** (HMAC-SHA256, constant-time) for Paddle.
- **Signed URLs** for all storage access; buckets are private.
- **Safe error logging** that redacts secrets (`src/lib/logger.ts`) into `error_logs`.
- **Atomic credit math** via SECURITY DEFINER RPCs restricted to the service role.

## 16. Known limitations

- Crop/Resize is a client-side placeholder (no AI credit cost).
- Intelligence modules (market research, omnichannel CS, live selling) have UI foundations; external channel APIs must be connected in production.
- Konsta UI is optional for mobile polish — Capacitor WebView uses the responsive Tailwind layout by default.
- Tests cover pure logic (validation, credits, webhook signing); add integration tests against a Supabase test project for full coverage.

## 17. Next recommended improvements

- Persist AI outputs into `processed-assets` and link them to `ai_jobs`.
- Real-time job status (Supabase Realtime) and a richer history panel.
- Stripe-style usage metering and credit top-up packs via Paddle.
- Team invitations UI and approval workflow screens.
- MFA / biometric login on mobile; rate limiting on AI routes.
- Generate Supabase types with `supabase gen types typescript`.

---

CLARTAS — AI E-Commerce Content Factory.
