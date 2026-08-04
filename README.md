# The Publishers House — Content CMS

Standalone admin app for managing Firestore content (sermons, events, articles, programs, leadership).

## Setup

1. Copy `.env.example` to `.env` and fill in your Firebase web config.
2. In Firebase Console: enable **Authentication → Email/Password** and create an admin user.
3. Create a Cloud Firestore database (if not already).
4. Publish security rules from `firestore.rules` (Console → Firestore → Rules, or `firebase deploy --only firestore:rules`).
5. Install and run:

```bash
npm install
npm run dev
```

## Public site handoff

See **[HANDOFF.md](./HANDOFF.md)** for collection schemas, read patterns, brand tokens, and notes for Micha.

## Stack

Vite + React 19 + TypeScript + React Router + Firebase Auth / Firestore
