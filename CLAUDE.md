# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ThriveStack Documentation is a **static HTML documentation site** — no build step, no framework, no bundler. Files are deployed directly to AWS S3 + CloudFront via GitHub Actions on push to `main`.

## Deployment

- **CI/CD:** `.github/workflows/main.yml` — syncs all files to S3, then invalidates CloudFront cache
- **S3 bucket:** `PROD_AWS_S3_BUCKET_NAME` (GitHub secret)
- **CloudFront distribution:** `EAZNJ59O08YJX`
- Changes go live after push to `main` triggers the workflow

## Architecture

### File Structure

- **Root HTML pages** — the 13 main documentation pages (e.g., `index.html`, `analyze-signals.html`)
- **`public/product/setup/`** — product instrumentation sub-pages
- **`public/marketing/setup/`** — marketing instrumentation sub-pages
- **`ai-setup/`** — LLM telemetry wizard prompts and rules (`prompt.txt`, `llms.txt`)
- **`styles.css`** — all styling (~41KB), uses CSS custom properties for light/dark themes
- **`script.js`** — all client-side interactivity (~12KB): theme toggle, search, ToC ScrollSpy, sidebar resize, feedback widget

### Page Structure Convention

Every HTML page follows the same layout:
1. `<script>` theme init block before paint (prevents FOUC)
2. Top navigation bar
3. Left sidebar with nested sections
4. Main content area with `<div class="content-section" id="...">` blocks
5. Footer feedback widget (`<div class="content-footer">`)

### Theme System

- CSS custom properties with `[data-theme="dark"]` selector
- `localStorage` key: `theme` (values: `'light'` | `'dark'`), defaults to `'dark'`

### Search Index

`script.js` contains a hardcoded `docsIndex` array for cross-page search. When adding new pages or sections, update this array to include the new page's title, URL, and keyword terms.

### Relative Paths

Pages nested under `public/` use relative paths (`../../`, `../../../`) to reference shared assets (`styles.css`, `script.js`, `logo.png`). Maintain this convention when creating nested pages.

## Utility Scripts

- **`update.js`** — Node.js script that walks all HTML files and updates relative path prefixes for internal links based on nesting depth
- **`replace.py` / `replace.ps1`** — bulk string replacement across HTML files
- **`update_marketing_sidebar.*`** — bulk sidebar structure updates for marketing pages

Run these with Node (`node update.js`) or Python (`python replace.py`) directly — no install step needed.

## AI Telemetry Integration

The `ai-setup/` and `public/*/setup/` directories contain LLM-readable instrumentation guides (`llms.txt`) and wizard prompts (`prompt.txt`). These teach LLMs how to instrument codebases with ThriveStack telemetry. The `{{THRIVESTACK_API_KEY}}` placeholder in prompt files is intentional — it's filled in by the calling application.
