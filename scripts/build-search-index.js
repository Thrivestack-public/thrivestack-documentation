#!/usr/bin/env node
/**
 * Build, validate, and write search-index.json from HTML.
 * Run from repo root: node scripts/build-search-index.js
 *
 * Merges with the existing index to preserve curated keywords and stable ids.
 */

const fs = require("fs");
const path = require("path");

const REPO_ROOT = path.resolve(__dirname, "..");
const INDEX_PATH = path.join(REPO_ROOT, "search-index.json");
const INDEX_VERSION = 2;

const STOPWORDS = new Set([
    "a", "an", "the", "and", "or", "to", "for", "of", "in", "on", "at", "by", "with", "from",
    "is", "are", "was", "be", "it", "its", "this", "that", "your", "you", "we", "our", "how",
    "what", "when", "where", "why", "does", "do", "can", "will", "should", "create", "choose",
    "problem", "details", "example", "documentation", "overview", "step", "go", "thrivestack"
]);

const EXCLUDED_DIRS = new Set([".git", ".github", "node_modules"]);

function walkHtmlFiles(dir, files = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (EXCLUDED_DIRS.has(entry.name)) continue;
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            walkHtmlFiles(fullPath, files);
        } else if (entry.name.endsWith(".html")) {
            files.push(fullPath);
        }
    }
    return files;
}

function toRepoPath(absPath) {
    return path.relative(REPO_ROOT, absPath).split(path.sep).join("/");
}

function stripTags(html) {
    return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function firstMatch(content, regex) {
    const match = content.match(regex);
    return match ? match[1].trim() : "";
}

function slugifyIdPart(value) {
    return String(value ?? "")
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80);
}

function inferSection(pageUrl) {
    const page = pageUrl.split("#")[0];
    if (page === "index.html") return "Getting Started";
    if (page === "api-reference.html" || page.startsWith("public/api/")) return "API";
    if (page.startsWith("public/product/")) return "Product";
    if (page.startsWith("public/marketing/")) return "Marketing";
    if (page.startsWith("public/revenue/")) return "Revenue";
    if (page.startsWith("public/customer-success/")) return "Customer Success";
    if (page.startsWith("public/crm-sync/")) return "CRM Sync";
    if (page.startsWith("setup/")) return "Documentation";
    if (page === "setup-overview.html") return "Setup (Unify)";
    if (page.startsWith("analyze-")) return "Analyze";
    if (page === "connect-your-stack.html") return "Connect";
    if (page === "startup-cohort-discount.html") return "Discounts";
    if (page.startsWith("guided-")) return "Guides";
    if (page === "take-action.html") return "Take Action";
    if (page === "account-intelligence.html") return "Take Action";
    if (
        page === "accelerate-free-to-paid.html" ||
        page === "drive-revenue-playbooks.html" ||
        page === "stop-churn-early.html" ||
        page === "spot-expansion-signals.html"
    ) {
        return "Take Action";
    }
    return "Documentation";
}

function extractPageMeta(html) {
    const title =
        firstMatch(html, /<h1[^>]*class="doc-page-title"[^>]*>([\s\S]*?)<\/h1>/i) ||
        firstMatch(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i) ||
        firstMatch(html, /<title>([\s\S]*?)<\/title>/i).replace(/\s*[-|].*$/, "").trim();

    const description =
        firstMatch(html, /<p[^>]*class="doc-page-description"[^>]*>([\s\S]*?)<\/p>/i) ||
        firstMatch(html, /<meta[^>]*name="description"[^>]*content="([^"]*)"/i) ||
        title;

    return {
        title: stripTags(title),
        description: stripTags(description)
    };
}

function extractSections(html) {
    const sections = [];
    const regex =
        /<section\b[^>]*\bid=["']([^"']+)["'][^>]*\bclass=["'][^"']*\bcontent-section\b[^"']*["'][^>]*>([\s\S]*?)<\/section>/gi;

    let match;
    while ((match = regex.exec(html)) !== null) {
        const id = match[1];
        const body = match[2];
        const heading =
            firstMatch(body, /<h2[^>]*>([\s\S]*?)<\/h2>/i) ||
            firstMatch(body, /<h1[^>]*>([\s\S]*?)<\/h1>/i) ||
            id;
        sections.push({
            id,
            heading: stripTags(heading)
        });
    }
    return sections;
}

function tokenize(text) {
    return String(text ?? "")
        .toLowerCase()
        .replace(/[^a-z0-9_-]+/g, " ")
        .split(/\s+/)
        .filter(Boolean);
}

function expandCompoundKeywords(keywords) {
    const expanded = [...keywords];
    for (const keyword of keywords) {
        if (!keyword.includes("_")) continue;
        for (const part of keyword.split("_")) {
            if (part.length > 1) expanded.push(part);
        }
    }
    return expanded;
}

function buildKeywords(parts) {
    const raw = [];
    for (const part of parts) {
        for (const token of tokenize(part)) {
            if (STOPWORDS.has(token) || token.length < 2) continue;
            raw.push(token);
        }
    }

    const withCompounds = expandCompoundKeywords(raw);
    const unique = [];
    const seen = new Set();
    for (const keyword of withCompounds) {
        if (seen.has(keyword)) continue;
        seen.add(keyword);
        unique.push(keyword);
    }
    return unique.slice(0, 12);
}

function makeId(url, description) {
    const base = url.replace(/\.html/g, "").replace(/[#/]/g, "-");
    return `${slugifyIdPart(base)}-${slugifyIdPart(description)}`.replace(/-+/g, "-");
}

function buildEntriesFromHtml() {
    const htmlFiles = walkHtmlFiles(REPO_ROOT);
    const entries = [];
    const seenUrls = new Set();

    for (const absPath of htmlFiles.sort()) {
        const pageUrl = toRepoPath(absPath);
        const html = fs.readFileSync(absPath, "utf8");
        const pageMeta = extractPageMeta(html);
        const sectionLabel = inferSection(pageUrl);

        if (!seenUrls.has(pageUrl)) {
            seenUrls.add(pageUrl);
            entries.push({
                id: makeId(pageUrl, pageMeta.title),
                title: pageMeta.title,
                url: pageUrl,
                section: sectionLabel,
                description: pageMeta.description,
                keywords: buildKeywords([pageUrl, pageMeta.title, pageMeta.description, sectionLabel]),
                deprecated: false
            });
        }

        for (const section of extractSections(html)) {
            const url = `${pageUrl}#${section.id}`;
            if (seenUrls.has(url)) continue;
            seenUrls.add(url);

            const isPageWrapper = section.id === path.basename(pageUrl, ".html").replace(/_/g, "-") ||
                section.heading.toLowerCase() === pageMeta.title.toLowerCase();

            entries.push({
                id: makeId(url, section.heading),
                title: pageMeta.title,
                url,
                section: sectionLabel,
                description: isPageWrapper ? pageMeta.description : section.heading,
                keywords: buildKeywords([
                    pageUrl,
                    pageMeta.title,
                    section.heading,
                    section.id,
                    sectionLabel
                ]),
                deprecated: false
            });
        }
    }

    return entries;
}

function loadExistingIndex() {
    if (!fs.existsSync(INDEX_PATH)) {
        return { entries: [] };
    }
    return JSON.parse(fs.readFileSync(INDEX_PATH, "utf8"));
}

function mergeEntries(generated, existingEntries) {
    const existingByUrl = new Map(existingEntries.map((entry) => [entry.url, entry]));
    const generatedUrls = new Set(generated.map((entry) => entry.url));
    const merged = [];

    for (const entry of generated) {
        const previous = existingByUrl.get(entry.url);
        if (previous) {
            merged.push({
                ...entry,
                id: previous.id || entry.id,
                section: previous.section || entry.section,
                keywords:
                    Array.isArray(previous.keywords) && previous.keywords.length > 0
                        ? previous.keywords
                        : entry.keywords,
                deprecated: previous.deprecated === true ? true : false
            });
        } else {
            merged.push(entry);
        }
    }

    for (const previous of existingEntries) {
        if (generatedUrls.has(previous.url)) continue;
        merged.push({
            ...previous,
            deprecated: true
        });
    }

    merged.sort((a, b) => a.url.localeCompare(b.url));
    return merged;
}

function validateIndex(entries) {
    const errors = [];
    const ids = new Set();
    const urls = new Set();

    for (const entry of entries) {
        if (!entry.id) errors.push(`Missing id for url ${entry.url}`);
        if (!entry.title) errors.push(`Missing title for url ${entry.url}`);
        if (!entry.url) errors.push("Entry missing url");
        if (!entry.section) errors.push(`Missing section for url ${entry.url}`);
        if (!entry.description) errors.push(`Missing description for url ${entry.url}`);
        if (!Array.isArray(entry.keywords)) errors.push(`keywords must be an array for ${entry.url}`);
        if (typeof entry.deprecated !== "boolean") errors.push(`deprecated must be boolean for ${entry.url}`);

        if (entry.id) {
            if (ids.has(entry.id)) errors.push(`Duplicate id: ${entry.id}`);
            ids.add(entry.id);
        }
        if (entry.url) {
            if (urls.has(entry.url)) errors.push(`Duplicate url: ${entry.url}`);
            urls.add(entry.url);
        }

        if (Array.isArray(entry.keywords)) {
            const keywordSet = new Set();
            for (const keyword of entry.keywords) {
                if (keywordSet.has(keyword)) {
                    errors.push(`Duplicate keyword "${keyword}" in ${entry.url}`);
                }
                keywordSet.add(keyword);
            }
        }

        const pageUrl = entry.url.split("#")[0];
        const pagePath = path.join(REPO_ROOT, pageUrl);
        if (!entry.deprecated && !fs.existsSync(pagePath)) {
            errors.push(`Missing HTML file for active entry: ${entry.url}`);
        }

        if (entry.url.includes("#")) {
            const hash = entry.url.split("#")[1];
            const html = fs.readFileSync(pagePath, "utf8");
            if (!entry.deprecated && !html.includes(`id="${hash}"`) && !html.includes(`id='${hash}'`)) {
                errors.push(`Missing section anchor #${hash} in ${pageUrl}`);
            }
        }
    }

    return errors;
}

function main() {
    const existing = loadExistingIndex();
    const generated = buildEntriesFromHtml();
    const entries = mergeEntries(generated, existing.entries || []);
    const errors = validateIndex(entries);

    if (errors.length > 0) {
        console.error("search-index validation failed:\n");
        for (const error of errors) {
            console.error(`  - ${error}`);
        }
        process.exit(1);
    }

    const output = {
        version: INDEX_VERSION,
        generatedAt: new Date().toISOString(),
        source: "thrivestack-documentation",
        entries
    };

    fs.writeFileSync(INDEX_PATH, `${JSON.stringify(output, null, 2)}\n`, "utf8");

    const activeCount = entries.filter((entry) => !entry.deprecated).length;
    const deprecatedCount = entries.filter((entry) => entry.deprecated).length;
    console.log(`Wrote ${INDEX_PATH}`);
    console.log(`Entries: ${entries.length} (${activeCount} active, ${deprecatedCount} deprecated)`);
}

main();
