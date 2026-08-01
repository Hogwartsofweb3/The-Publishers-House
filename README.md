# The Publishers House — Official Website

**Stack:** Next.js 16 · Strapi CMS · Paystack · Cloudflare · Vercel

## Project Structure

```
/
├── publishers-house/        ← Next.js app (App Router)
│   ├── src/
│   │   ├── app/             ← All page routes
│   │   │   ├── page.tsx             (Homepage)
│   │   │   ├── about/page.tsx
│   │   │   ├── resources/page.tsx
│   │   │   ├── programs/page.tsx
│   │   │   ├── articles/page.tsx
│   │   │   ├── events/page.tsx
│   │   │   ├── giving/page.tsx
│   │   │   └── contact/page.tsx
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   └── lib/
│   │       └── strapi.ts    ← CMS API layer
│   ├── .env.example         ← Required env vars
│   └── next.config.ts
├── vercel.json              ← Points Vercel to publishers-house/ subdirectory
└── README.md
```

## Getting Started

```bash
cd publishers-house
cp .env.example .env.local
# Fill in .env.local with Strapi URL, API token, and Paystack keys
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

See `publishers-house/.env.example` for all required variables.

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_STRAPI_URL` | Strapi CMS base URL |
| `STRAPI_API_TOKEN` | Strapi API token (server-side only) |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Paystack public key |
| `PAYSTACK_SECRET_KEY` | Paystack secret key |
| `NEXT_PUBLIC_SITE_URL` | Production URL |

## Deployment

This project auto-deploys to [Vercel](https://vercel.com/tph2/the-publishers-house) on every push to `main`.
