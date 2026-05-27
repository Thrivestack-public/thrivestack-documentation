# Search index maintenance (`search-index.json`)

This file powers **documentation search in the ThriveStack app** (Home → Growth Metrics search). The docs site also has a legacy inline index in `script.js` (`docsIndex`); keep both in mind when you change navigation, but **`search-index.json` is the source of truth for the product UI**.

## Where the files live

| Repo | File | Role |
|------|------|------|
| **thrivestack-documentation** (canonical) | `search-index.json` | Edit here first |
| **plg-crm-ui** (copy) | `src/data/docs-search-index.json` | Bundled into the app at build time |

After every change to `search-index.json`, copy it into the app repo:

```bash
cp search-index.json \
  ../plg-crm-ui/src/data/docs-search-index.json
```

Rebuild or restart the dev server so webpack picks up the JSON change.

Production docs links from the app always open **`https://docs.app.thrivestack.ai/...`**. Entry `url` values are **relative to the docs site root**.

Section rows (index **v2**) use **Option B** display: `title` = parent page name, `description` = section `h2`. Example — searching "auth" shows **Group** with subtitle **Authentication**, not eight rows all titled "Authentication".

---

## When to update

| Event | Action |
|-------|--------|
| **New HTML page** | Add a **page-level** entry (`url` without `#`) |
| **New in-page section** (`<section class="content-section" id="...">`) | Add a **section-level** entry (`url` with `#section-id`) |
| **Title or summary changed** | Update `title`, `description` |
| **Topic / terminology changed** | Refresh `keywords` |
| **Page removed or retired** | Set `"deprecated": true` — do **not** delete the row immediately |
| **Page restored** | Set `"deprecated": false` and fix `url` / keywords if needed |

Deprecated entries are **hidden in app search** (`UnifiedView` filters `!e.deprecated`) but stay in the file for history and easier rollback.

---

## Entry schema

```json
{
  "id": "public-product-setup-stripe-integration",
  "title": "Stripe Integration",
  "url": "public/revenue/setup/stripe-integration.html",
  "section": "Revenue",
  "description": "Connect Stripe for billing and revenue sync.",
  "keywords": [
    "stripe",
    "integration",
    "connector",
    "webhooks",
    "subscriptions",
    "billing",
    "revenue"
  ],
  "deprecated": false
}
```

### Field reference

| Field | Required | Notes |
|-------|----------|--------|
| `id` | Yes | Stable unique id. Convention: path + slug, kebab-case, e.g. `public-api-identify-identify` for `public/api/identify.html#identify` |
| `title` | Yes | **Page row:** page `h1`. **Section row (`#`):** parent page title (what search shows as the main label) |
| `url` | Yes | Relative to docs root. Section anchors: `page.html#section-id` |
| `section` | Yes | Group label in the index: `API`, `Product`, `Marketing`, `Revenue`, `Analyze`, `Take Action`, `CRM Sync`, `Customer Success`, `Discounts`, `Documentation`, etc. |
| `description` | Yes | **Page row:** short summary. **Section row:** the section `h2` heading (shown as subtitle in app search, e.g. "Authentication") |
| `keywords` | Yes | **Array of strings** — see [Keywords](#keywords) |
| `deprecated` | Yes | `false` by default; `true` when the page is removed or should not appear in search |

Top-level index metadata (update when you ship a batch of changes):

```json
{
  "version": 2,
  "generatedAt": "2026-05-27T11:01:18.386Z",
  "source": "thrivestack-documentation",
  "entries": [ ... ]
}
```

**Section row example (v2):**

```json
{
  "title": "Group",
  "url": "public/api/group.html#authentication",
  "description": "Authentication",
  "section": "API",
  "keywords": ["group", "authentication", "api_key", "..."]
}
```

When adding a new `#section` entry, set `title` from the **page-level** row (same file, no hash), and `description` from the section heading.

Regenerate the full index from HTML (merge keeps existing keywords and ids):

```bash
node scripts/build-search-index.js
```

This script walks all HTML files, builds page and section rows, validates the result, and writes `search-index.json`. CI runs it on every push to `main` before S3 deploy.

---

## Page-level vs section-level entries

- **Page-level** — one row per HTML file, `url` with no hash:  
  `public/marketing/setup/google-ads.html`
- **Section-level** — one row per major `content-section` (or doc sidebar anchor), `url` with hash:  
  `analyze-signals.html#identify-high-intent-signals`

Use section entries when the sidebar has distinct topics users search for (e.g. “growth leaks”, “HubSpot outbound”, “Stripe connector”). Avoid indexing every `h2` on long API pages unless it is a real navigation target.

---

## Keywords

Keywords are what make Home search useful. The app matches if **any** keyword **contains** the query (substring, case-insensitive), and also matches `title`, `description`, and `section`.

### Use impactful terms

Prefer words a user would actually type:

| Good | Poor |
|------|------|
| `stripe`, `webhook`, `hubspot`, `churn`, `mrr`, `identify`, `utm` | `the`, `an`, `how`, `create`, `your`, `overview`, `step` |
| `api_key`, `oauth`, `subscriptions` | Splitting the page title into generic tokens only |

Think: **product names, integrations, metrics, API names, setup tasks** — not grammar words from headings.

### Stopwords — do not add

Avoid these (and similar) as standalone keywords:

`a`, `an`, `the`, `and`, `or`, `to`, `for`, `of`, `in`, `on`, `at`, `by`, `with`, `from`, `is`, `are`, `was`, `be`, `it`, `its`, `this`, `that`, `your`, `you`, `we`, `our`, `how`, `what`, `when`, `where`, `why`, `does`, `do`, `can`, `will`, `should`, `create`, `choose`, `problem`, `details`, `example`, `documentation`, `overview`, `step`, `go`

Generic section titles repeated across many pages (`Authentication`, `Endpoint`, `Example`) must use **page-specific** keywords (e.g. `identify` + `x-api-key`, not `authentication` alone).

### Format rules

- **Always** use `keywords` as a **JSON array of strings**, never one long space-separated string.
- Use **lowercase** unless the term is naturally cased (`HubSpot` → prefer `hubspot` for matching).
- Prefer **snake_case** for multi-word concepts in the index: `google_ads`, `revenue_churn`, `health_scores`.
- Use **hyphens** only when they appear in real identifiers (`x-api-key`).

### Compound keywords (`snake_case`)

For terms like `google_ads`, `revenue_churn`, `correlated_signals`, `cross_channel`:

1. **Keep** the compound token: `google_ads`
2. **Also add** each underscore-separated part if not already present: `google`, `ads`

Example:

```json
"keywords": [
  "google_ads",
  "google",
  "ads",
  "utm",
  "gclid",
  "campaigns",
  "paid_search",
  "paid",
  "search",
  "attribution",
  "marketing"
]
```

Do **not** duplicate a token in the same entry (if `churn` is already listed, do not add it again when expanding `revenue_churn`).

Hyphenated tokens (`x-api-key`) are **not** auto-split; add `api`, `key` manually if you want those matches.

### Keywords per entry type

| Entry type | Keyword focus |
|------------|----------------|
| API pages | Endpoint name, HTTP method, payload fields (`user_id`, `traits`), service (`graphql`, `rest`) |
| Setup pages | Integration name, tool (`cursor`, `mcp`), data source (`stripe`, `chargebee`) |
| Analyze / Take Action | Outcome (`churn`, `expansion`, `activation`), playbook concepts |
| CRM / CS | `hubspot`, `import`, `export`, `health_scores` |

Aim for **6–12** strong keywords per entry after compound expansion.

---

## Removing or retiring content

When an article is taken down or should no longer appear in product search:

1. Find all index rows for that page (page-level **and** section-level `url`s).
2. Set `"deprecated": true` on each.
3. Optionally add a one-line note in `description`: `"Retired — see …"` (still hidden from search).
4. Copy `search-index.json` to `plg-crm-ui`.

Do **not** remove rows immediately unless you are sure nothing links to that `id`. Deprecated rows keep old bookmarks and make restores easier.

When a page is **renamed or moved**, update `url` (and `id` if you treat ids as path-derived), set `deprecated: false`, and deprecate the old `url` row if you keep it for redirect documentation.

---

## Workflow checklist

### New or updated article

1. [ ] Add or update HTML in this repo (sidebar + `content-section` ids if needed).
2. [ ] Add or update row(s) in `search-index.json` with correct `url`, `section`, `title`, `description`.
3. [ ] Curate `keywords` (impactful terms + compound split, no stopwords, no duplicates).
4. [ ] Set `deprecated: false`.
5. [ ] Update `generatedAt`.
6. [ ] Copy JSON to `plg-crm-ui/src/data/docs-search-index.json`.
7. [ ] Smoke-test Home search: query terms you added (e.g. `stripe`, `hubspot`, `churn`).
8. [ ] (Optional) Update legacy `docsIndex` in `script.js` if docs-site ⌘K search should include the page.

### Retired article

1. [ ] Set `deprecated: true` on all related entries.
2. [ ] Update `generatedAt`.
3. [ ] Copy JSON to plg-crm-ui.
4. [ ] Confirm the page no longer appears in Home search.

---

## Validation

CI and local checks use the same script:

```bash
node scripts/build-search-index.js
```

The script fails (exit code 1) on duplicate ids/urls, duplicate keywords within an entry, missing HTML files, or missing section anchors. On success it rewrites `search-index.json` with an updated `generatedAt` timestamp.

Search in the app runs on Home (Growth Metrics) and global ⌘K; results open in a new tab at `https://docs.app.thrivestack.ai/...`.

---

## Related code

| Location | Behavior |
|----------|----------|
| `plg-crm-ui` → `DocsSearch.tsx` | Loads `docs-search-index.json`, filters `!deprecated`, matches title / description / section / keywords; Home row UI |
| `thrivestack-documentation` → `script.js` | Legacy `docsIndex` for on-site search (separate from `search-index.json`) |

When in doubt, edit **`search-index.json` first**, then sync to the app.
