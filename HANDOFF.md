# Handoff — The Publishers House public site

For **Micha** (public site) and anyone reading from the same Firebase project the CMS uses.

**Firebase project:** `thepublishershouse-6d1cf`  
**CMS app:** sibling repo `thepublishershousecms` (admin only; not for public visitors)  
**Domain (target):** cms.thepublishershouse.org

---

## Access model

| Client | Auth | Access |
| --- | --- | --- |
| CMS (`thepublishershousecms`) | Email/password (Firebase Auth) | Read + write all content docs |
| Public site / future apps | None required | **Read published docs only** (`published == true`) |

Deploy rules from this repo:

1. Firebase Console → Firestore → **Rules** → paste `firestore.rules`, **Publish**, **or**
2. `firebase deploy --only firestore:rules` (with Firebase CLI logged into the project)

Public queries **must** filter published content or they will fail under these rules:

```ts
where('published', '==', true)
```

There is **no Firebase Storage** in this phase. All media fields are **string URLs** (YouTube/Vimeo, MP3, PDF, CDN image links, etc.).

Giving / Paystack / Flutterwave are **out of scope** for this CMS phase — build separately on the public site.

---

## Collections

Shared on every document:

| Field | Type | Notes |
| --- | --- | --- |
| `createdAt` | Timestamp | Server-set on create |
| `updatedAt` | Timestamp | Server-set on create/update |
| `published` | boolean | Public site should only show `true` |
| `order` | number (optional) | Used especially on `leadership` |

Document IDs are auto-generated Firestore IDs.

### `sermons`

| Field | Type | Notes |
| --- | --- | --- |
| `title` | string | |
| `speaker` | string | |
| `date` | string | `YYYY-MM-DD` (date preached) |
| `videoUrl` | string | YouTube **or** Vimeo URL |
| `audioUrl` | string | MP3 / hosted audio URL |
| `studyGuideUrl` | string | PDF / doc URL |
| `series` | string | e.g. Didache |
| `tags` | string[] | |

Suggested query: published sermons by date descending.

```ts
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'

const q = query(
  collection(db, 'sermons'),
  where('published', '==', true),
  orderBy('date', 'desc'),
)
const snap = await getDocs(q)
const sermons = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
```

> Compound `where` + `orderBy` may require a Firestore composite index. The Console will link to create it on first failed query.

### `events`

| Field | Type | Notes |
| --- | --- | --- |
| `title` | string | |
| `summary` | string | Short card line |
| `description` | string | Full write-up (markdown/plain) |
| `startAt` | string | `datetime-local` value, e.g. `2026-08-10T09:00` |
| `endAt` | string | Optional end |
| `location` | string | Venue |
| `imageUrl` | string | Cover image URL |
| `registrationUrl` | string | Optional |

Suggested sort: `orderBy('startAt', 'asc' | 'desc')` with `published == true`.

### `articles`

| Field | Type | Notes |
| --- | --- | --- |
| `title` | string | |
| `slug` | string | URL segment |
| `excerpt` | string | |
| `body` | string | Markdown or plain text |
| `coverImageUrl` | string | |
| `author` | string | |
| `categories` | string[] | e.g. Faith, Devotionals, Family |
| `publishedAt` | string | `YYYY-MM-DD` editorial date |

Detail page: look up by `slug` (+ `published == true`). Category filters: `array-contains` on `categories`.

### `programs`

| Field | Type | Notes |
| --- | --- | --- |
| `name` | string | |
| `slug` | string | |
| `summary` | string | |
| `frequency` | string | e.g. Annual, Monthly |
| `imageUrl` | string | |
| `detailsUrl` | string | Optional external/detail link |

Suggested flagship seeds (create via CMS; not hardcoded):

| Name | Frequency |
| --- | --- |
| Festival of Light | Annual |
| Merismos | Annual |
| Jesus Convention | Annual (Easter) |
| The Forge | Monthly (end of month) |
| Abuja Apostolic Camp | Monthly (first ~2 weeks) |

### `leadership`

| Field | Type | Notes |
| --- | --- | --- |
| `name` | string | e.g. Dr. Joshua Agunbiade |
| `role` | string | |
| `bio` | string | |
| `photoUrl` | string | Portrait URL |
| `order` | number | Lower first |

Suggested query: `where('published','==',true), orderBy('order','asc')`.

---

## Minimal Firebase web init (public site)

Use the same web config as the CMS (Vite/env vars or build-time config). Example:

```ts
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
// Do not require Auth for public reads of published content.
```

---

## Brand tokens (align public UI)

From the TPH brand guide — CMS uses these in `src/styles/tokens.css`:

| Token | Hex | Use |
| --- | --- | --- |
| Navy | `#151A54` | Primary dark / headings |
| Blue primary | `#0140C1` | Buttons, links, accents |
| Blue bright | `#2090FF` | Focus / hover accents |
| Blue electric | `#0100FE` | Strong accent (sparingly) |
| Blue muted | `#99AFC6` / `#747CA1` | Borders, muted text |
| Blue deep | `#29547E` | Secondary text |
| White / ivory | `#FFFFFF` / `#F7F8FC` | Surfaces |
| Black | `#000000` | High contrast |

**Type:** Poppins (UI) + Playfair Display (display headings). Logo lockups use proprietary fonts — prefer PNG/SVG assets, not web font files for Soulmaze / Heuvel.

Tagline: **Company of the Great** (Psalm 68:11).

---

## Ministry reference (hardcode until `siteSettings`)

Not in Firestore yet — safe to hardcode on the public site for v1:

| Item | Value |
| --- | --- |
| Sunday Worship | Sunday · 9:00 AM WAT |
| Midweek Service | Thursday · **confirm 5:00 PM (Overview) vs 4:30 PM (brand guide)** |
| Venue | House of Bread, Korinjoh House, British, Jos, Plateau State |
| Outreach | Abuja |

Deferred CMS collection (later): `siteSettings` for livestream URL, greeting, service times, contact/social, About vision/beliefs.

---

## What this CMS does *not* provide

- Public marketing pages (Homepage, About, Contact, Giving UI)
- File uploads / Firebase Storage
- Paystack / Flutterwave / donation webhooks
- Multi-role approval workflows (only a `published` flag)
- `siteSettings` / static page CMS

Questions on schemas: check `src/types/content.ts` in `thepublishershousecms` as the TypeScript source of truth.
