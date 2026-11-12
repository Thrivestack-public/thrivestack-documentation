document.addEventListener('DOMContentLoaded', () => {
    mountDocsShell();

    // Code tab switching (.tab-btn / .tab-pane pattern used in API reference pages)
    document.querySelectorAll('.code-tabs').forEach(function(tabGroup) {
        tabGroup.querySelectorAll('.tab-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var tab = btn.getAttribute('data-tab');
                tabGroup.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
                tabGroup.querySelectorAll('.tab-pane').forEach(function(p) { p.classList.remove('active'); });
                btn.classList.add('active');
                tabGroup.querySelector('.tab-pane[data-tab="' + tab + '"]').classList.add('active');
            });
        });
    });

    // Ensure scroll to top on page load unless navigating to a specific hash
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    if (!window.location.hash) {
        window.scrollTo(0, 0);
    }

    // Theme Toggle Logic
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const htmlEl = document.documentElement;

    // Check for saved theme or default to dark
    const savedTheme = localStorage.getItem('theme') || 'dark';
    htmlEl.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = htmlEl.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        htmlEl.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        if (theme === 'dark') {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        } else {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
    }

    // Search with live suggestions: scroll to a matching heading
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        // container for suggestions
        const suggestions = document.createElement('div');
        suggestions.className = 'search-suggestions';
        searchInput.parentElement.appendChild(suggestions);

        const getHeadings = () => {
            const nodes = [];
            document.querySelectorAll('.content-section h2, .content-section h3, .doc-page-body h1, .doc-page-body h2')
                .forEach(h => {
                    const text = h.textContent.trim();
                    if (!text) return;
                    nodes.push({
                        text,
                        element: h
                    });
                });
            return nodes;
        };

        const headings = getHeadings();

        // Lightweight cross-page index
        const docsIndex = [
            {
                title: 'Getting Started with ThriveStack',
                url: 'index.html#growth-intelligence',
                terms: 'getting started growth intelligence overview unified dashboard signal correlation ai-powered insights'
            },
            {
                title: 'Analyze Signals',
                url: 'analyze-signals.html#identify-high-intent-signals',
                terms: 'analyze signals identify high-intent signals account intelligence bow-tie revenue model analyze revenue & churn churn prediction revenue analytics nrr waterfall cac payback ltv/cac expansion'
            },
            {
                title: 'Take Action',
                url: 'take-action.html#automate-workflow-responses',
                terms: 'take action automate workflow responses act on signals automated workflow engine signal detected action triggered slack alert account owner'
            },
            {
                title: 'Account Intelligence',
                url: 'account-intelligence.html#account-intelligence',
                terms: 'account intelligence take action playbooks signed up not activated activation struggling stalled journey activated not converted pql product qualified leads converted disengaging churn risk save play getaccounts getsegments brevo n8n openclaw automation drive action which accounts'
            },
            {
                title: 'Connect Your Stack',
                url: 'connect-your-stack.html#connect-your-stack',
                terms: 'connect your stack integrations unify data plug and play low code'
            },
            {
                title: 'Analyze Correlated Signals',
                url: 'analyze-correlated-signals.html#analyze-correlated-signals',
                terms: 'analyze correlated signals ai comparison funnel leaks bottlenecks'
            },
            {
                title: 'Drive Revenue Playbooks',
                url: 'drive-revenue-playbooks.html#drive-revenue-playbooks',
                terms: 'drive revenue playbooks alerts slack crm actions'
            },
            {
                title: 'Accelerate Free-to-Paid',
                url: 'accelerate-free-to-paid.html#accelerate-free-to-paid',
                terms: 'accelerate free to paid onboarding funnel conversion'
            },
            {
                title: 'Spot Expansion Signals',
                url: 'spot-expansion-signals.html#spot-expansion-signals',
                terms: 'spot expansion signals nrr upsell cross sell'
            },
            {
                title: 'Stop Churn Early',
                url: 'stop-churn-early.html#stop-churn-early',
                terms: 'stop churn early contraction risk health widget'
            },
            {
                title: 'Events Telemetry',
                url: 'product/setup/saas-growth-events.html#saas-growth-events',
                terms: 'journey to event bow tie phases telemetry mapping'
            },
            {
                title: 'Vibe Analytics (AI)',
                url: 'product/setup/vibe-analytics.html#vibe-analytics',
                terms: 'vibe analytics ai telemetry spec identify group track checklist'
            },
            {
                title: 'MCP Introduction',
                url: 'mcp/introduction.html#overview',
                terms: 'thrivestack mcp model context protocol introduction what is mcp remote server'
            },
            {
                title: 'MCP Setup',
                url: 'mcp/setup.html#server-url',
                terms: 'thrivestack mcp setup remote server implementation claude desktop claude code cursor windsurf gemini cli lovable troubleshooting technical specifications x-api-key oauth'
            },
            {
                title: 'MCP Use Cases',
                url: 'mcp/use-cases.html#getting-started',
                terms: 'thrivestack mcp use cases correlated journeys marketing product revenue drill down'
            },
            {
                title: 'MCP Prompts',
                url: 'mcp/prompts.html#prompts-intro',
                terms: 'thrivestack mcp example prompts tool oriented reference get_mau_mtu_count get_event_count list_accounts get_plg_leads get_setup_status getVisitor getPageViews getSignup acquisition conversion mrr stickiness dau wau mau activation churn expansion'
            },
            {
                title: 'MCP Tools',
                url: 'mcp/tools.html#overview',
                terms: 'thrivestack mcp tools catalog reference core analytics accounts gtm setup traffic acquisition activation revenue monetization usage engagement'
            },
            {
                title: 'MCP Changelog',
                url: 'mcp/changelog.html#overview',
                terms: 'thrivestack mcp changelog release notes what is new added changed new tools v1 get_page_traffic get_search_performance get_attribution_health list_urls'
            },
            {
                title: 'Revenue Intelligence MCP Introduction',
                url: 'revenue/mcp/introduction.html#overview',
                terms: 'revenue intelligence thrivestack mcp server connect claude cursor revenue marketing product analytics accounts mrr arr read-only oauth personal access token'
            },
            {
                title: 'Revenue Intelligence MCP Setup',
                url: 'revenue/mcp/setup.html#server-url',
                terms: 'revenue intelligence mcp setup connect claude desktop claude code cursor vs code windsurf gemini cli oauth personal access token verify connection troubleshooting'
            },
            {
                title: 'Revenue Intelligence MCP Use Cases',
                url: 'revenue/mcp/use-cases.html#example-workflows',
                terms: 'revenue intelligence thrivestack mcp use cases mrr movement churn revenue leakage missed payments acv channels campaigns ads leads activation retention at-risk accounts'
            },
            {
                title: 'Revenue Intelligence MCP Prompts',
                url: 'revenue/mcp/prompts.html#prompt-library',
                terms: 'revenue intelligence thrivestack mcp prompts monthly revenue review mrr movement leakage plan mix goal pacing channel review lead quality activation retention at-risk accounts account brief data health copy prompt'
            },
            {
                title: 'Revenue Intelligence MCP Tools',
                url: 'revenue/mcp/tools.html#tool-catalog',
                terms: 'revenue intelligence thrivestack mcp tools reference get_revenue_kpis get_mrr_movements get_channel_performance get_website_traffic get_ads_performance get_lead_quality get_mau_mtu_count get_activation_summary get_retention_data list_at_risk_accounts get_account_overview create_account_segment start_thrivestack_setup'
            },
            {
                title: 'Cited By Introduction',
                url: 'cited-by/introduction.html#overview',
                terms: 'cited by ai visibility aeo geo brand mentions prompts citations competitors introduction bulk import mcp'
            },
            {
                title: 'Cited By — What you can do',
                url: 'cited-by/introduction.html#what-you-can-do',
                terms: 'cited by track prompts citations competitors bulk import mcp agents'
            },
            {
                title: 'Cited By — Get started',
                url: 'cited-by/introduction.html#get-started',
                terms: 'cited by get started ai visibility prompts bulk upload mcp personal access token'
            },
            {
                title: 'Cited By MCP',
                url: 'cited-by/mcp.html',
                terms: 'cited by mcp agents claude cursor connect ai visibility'
            },
            {
                title: 'Connect Vercel (AI Crawl Attribution)',
                url: 'cited-by/ai-crawl-attribution-vercel.html#overview',
                terms: 'cited by ai crawl attribution connect vercel log drain integration marketplace ai crawlers gptbot claudebot perplexitybot bot traffic one click'
            },
            {
                title: 'Connect Vercel — Steps',
                url: 'cited-by/ai-crawl-attribution-vercel.html#connect',
                terms: 'connect vercel steps approve projects verify send test bot traffic activate ai crawl logs add-on'
            },
            {
                title: 'Connect Vercel — What ThriveStack collects',
                url: 'cited-by/ai-crawl-attribution-vercel.html#data',
                terms: 'vercel log drain data collected privacy permissions scopes ai crawler requests token'
            },
            {
                title: 'Connect Vercel — Troubleshooting',
                url: 'cited-by/ai-crawl-attribution-vercel.html#troubleshooting',
                terms: 'vercel troubleshooting hobby plan pro enterprise no data waiting for ai bot visit domain mismatch disconnect'
            },
            {
                title: 'Connect WordPress (AI Crawl Attribution)',
                url: 'cited-by/ai-crawl-attribution-wordpress.html#overview',
                terms: 'cited by ai crawl attribution connect wordpress plugin thrivestack ai crawler tracker server logs access log cache ai crawlers gptbot claudebot perplexitybot bot traffic'
            },
            {
                title: 'Connect WordPress — Steps',
                url: 'cited-by/ai-crawl-attribution-wordpress.html#connect',
                terms: 'connect wordpress steps download plugin upload install connection code test connection send now verify activate ai crawl logs add-on'
            },
            {
                title: 'Connect WordPress — What ThriveStack collects',
                url: 'cited-by/ai-crawl-attribution-wordpress.html#data',
                terms: 'wordpress plugin data collected privacy access log ai crawler requests no wordpress password needed fallback mode'
            },
            {
                title: 'Connect WordPress — Troubleshooting',
                url: 'cited-by/ai-crawl-attribution-wordpress.html#troubleshooting',
                terms: 'wordpress troubleshooting plugin fallback no readable access log connection code get a new code waiting for your plugin to connect listening first ai crawler visit send a test visit wp-cron send now disconnect'
            },
            {
                title: 'Cited By Prompts Bulk Import',
                url: 'cited-by/prompts-bulk-import.html#overview',
                terms: 'cited by prompts bulk import csv upload template column mapping entitlement'
            },
            {
                title: 'Bulk Import — Match Columns',
                url: 'cited-by/prompts-bulk-import.html#match-columns',
                terms: 'bulk import match columns mapper prompt topic dont import aliases query'
            },
            {
                title: 'Bulk Import — Plan Limits',
                url: 'cited-by/prompts-bulk-import.html#plan-limits',
                terms: 'bulk import plan limit entitlement upgrade add-on remaining slots'
            },
            {
                title: 'Bulk Import — Troubleshooting',
                url: 'cited-by/prompts-bulk-import.html#troubleshooting',
                terms: 'bulk import troubleshooting empty duplicate headers csv'
            },
            {
                title: 'API Reference',
                url: 'api-reference.html#overview',
                terms: 'api reference public endpoints rest http authentication bearer key'
            },
            {
                title: 'Identify Endpoint',
                url: 'api/identify.html#identify',
                terms: 'identify user traits email name user_id context group_id device_id session_id'
            },
            {
                title: 'Group Endpoint',
                url: 'api/group.html#group',
                terms: 'group account traits group_id user_id account_name account_domain group_type'
            },
            {
                title: 'Track Endpoint',
                url: 'api/track.html#track',
                terms: 'track event signed_up account_created feature_used invite_sent page_visit onboarding event_name properties'
            },
            {
                title: 'GetAccounts',
                url: 'api/get-accounts.html#get-accounts',
                terms: 'get accounts list graphql growth intelligence filters sort pagination segmentation acquisition activation monetization engagement expansion firmographics mrr arr dau mau churn healthy at risk account fields accountFieldByGraphQLKey public-api-events abuseRuleResult registry filterable sortable'
            },
            {
                title: 'GetAccountById',
                url: 'api/get-account-by-id.html#get-account-by-id',
                terms: 'get account by id graphql growth intelligence acquisition activation monetization engagement firmographics mrr arr dau mau single account profile'
            },
            {
                title: 'GetUsers',
                url: 'api/get-users.html#get-users',
                terms: 'get users list graphql growth intelligence filters sort pagination user segment cohort acquisition engagement demographics sign ins abuse status utm'
            },
            {
                title: 'GetUserById',
                url: 'api/get-user-by-id.html#get-user-by-id',
                terms: 'get user by id graphql growth intelligence acquisition engagement demographics employment title role signin'
            },
            {
                title: 'GetAccountEnrichment',
                url: 'api/get-account-enrichment.html#get-account-enrichment',
                terms: 'get account enrichment graphql domain firmographic industry employees revenue technology stack social linkedin twitter'
            },
            {
                title: 'GetUserEnrichment',
                url: 'api/get-user-enrichment.html#get-user-enrichment',
                terms: 'get user enrichment graphql email job title role seniority company linkedin social profiles location personalize onboarding'
            },
            {
                title: 'Transactions API',
                url: 'api/transactions.html#transactions',
                terms: 'transactions revenue billing crud create list get update delete payment amount currency status charge refund credit'
            },
            {
                title: 'Invoices API',
                url: 'api/invoices.html#invoices',
                terms: 'invoices billing revenue crud create list get update void due_date line_items total draft open paid'
            },
            {
                title: 'Subscriptions API',
                url: 'api/subscriptions.html#subscriptions',
                terms: 'subscriptions billing recurring revenue crud create list get update cancel plan interval status trial active past_due'
            },
            {
                title: 'Exceptional Use Cases',
                url: 'revenue/setup/exceptional-use-cases.html#exceptional-use-cases',
                terms: 'exceptional use cases chargebee stripe payment gateway marketplace platform fee revenue billing connect transactions api'
            },
            {
                title: 'Goal Conversion',
                url: 'marketing/setup/goal-conversion.html#create-goal',
                terms: 'goal conversion create goal event tracking pin dashboard goal completions unique visitors repeat visitors target date event filter ts-demo-booked verification pinned goals unified dashboard conversion rate signup demo request page visits'
            }
        ];

        const clearSuggestions = () => {
            suggestions.innerHTML = '';
            suggestions.style.display = 'none';
        };

        const scrollToElement = (el) => {
            const rect = el.getBoundingClientRect();
            const offsetTop = rect.top + window.scrollY - 80;
            window.scrollTo({ top: offsetTop, behavior: 'smooth' });
        };

        searchInput.addEventListener('input', () => {
            const query = searchInput.value.trim().toLowerCase();
            if (!query) {
                clearSuggestions();
                return;
            }

            const localMatches = headings
                .filter(h => h.text.toLowerCase().includes(query))
                .map(h => ({
                    label: h.text,
                    type: 'section',
                    onSelect: () => scrollToElement(h.element)
                }));

            const path = window.location.pathname.split('/').pop() || 'index.html';

            const globalMatches = docsIndex
                .filter(d =>
                    (d.title.toLowerCase().includes(query) ||
                     d.terms.toLowerCase().includes(query))
                )
                .filter(d => !path.endsWith(d.url.split('#')[0])) // avoid duplicate current page entry
                .map(d => ({
                    label: d.title,
                    type: 'page',
                    onSelect: () => {
                        clearSuggestions();
                        window.location.href = d.url;
                    }
                }));

            const allMatches = [...localMatches, ...globalMatches].slice(0, 7);

            if (!allMatches.length) {
                clearSuggestions();
                return;
            }

            suggestions.innerHTML = '';
            allMatches.forEach(match => {
                const item = document.createElement('button');
                item.type = 'button';
                item.className = 'search-suggestion-item';
                item.textContent = match.label;
                if (match.type === 'page') {
                    item.dataset.type = 'page';
                }
                item.addEventListener('click', match.onSelect);
                suggestions.appendChild(item);
            });
            suggestions.style.display = 'block';
        });

        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                clearSuggestions();
                searchInput.blur();
                return;
            }
            if (e.key === 'Enter') {
                const first = suggestions.querySelector('.search-suggestion-item');
                if (first) {
                    first.click();
                    e.preventDefault();
                }
            }
        });

        document.addEventListener('click', (e) => {
            if (!suggestions.contains(e.target) && e.target !== searchInput) {
                clearSuggestions();
            }
        });
    }

    // ScrollSpy for "On this page": follow whatever element each link points to (a section or a
    // heading inside one), so the highlight moves even when many headings share one section.
    const tocItems = Array.from(document.querySelectorAll('.toc-link')).map(link => {
        let id = (link.getAttribute('href') || '').slice(1);
        try { id = decodeURIComponent(id); } catch (e) { /* keep the raw id */ }
        return { link, el: id ? document.getElementById(id) : null };
    }).filter(item => item.el);

    if (tocItems.length) {
        const TOC_OFFSET = 120; // a heading counts as current once it passes this far below the top
        let tocActive = null;
        let tocTicking = false;

        const updateToc = () => {
            tocTicking = false;
            const tops = tocItems.map(item => item.el.getBoundingClientRect().top);
            let current = 0;
            for (let i = 0; i < tocItems.length; i++) {
                if (tops[i] <= TOC_OFFSET && (tops[current] > TOC_OFFSET || tops[i] >= tops[current])) current = i;
            }
            // Short last sections never reach the offset: at the very bottom, the last visible one wins.
            const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
            if (atBottom) {
                for (let i = tocItems.length - 1; i >= 0; i--) {
                    if (tops[i] < window.innerHeight) { current = i; break; }
                }
            }
            const next = tocItems[current].link;
            if (next === tocActive) return;
            tocActive = next;
            tocItems.forEach(item => item.link.classList.toggle('active', item.link === next));

            // Long lists scroll inside the sidebar; keep the current link in view there.
            const box = next.closest('.sticky-top');
            if (box && box.scrollHeight > box.clientHeight) {
                const linkRect = next.getBoundingClientRect();
                const boxRect = box.getBoundingClientRect();
                if (linkRect.top < boxRect.top || linkRect.bottom > boxRect.bottom) {
                    box.scrollTop += (linkRect.top - boxRect.top) - box.clientHeight / 2;
                }
            }
        };
        // A short timer rather than requestAnimationFrame: frames pause in background tabs.
        const requestToc = () => {
            if (!tocTicking) { tocTicking = true; window.setTimeout(updateToc, 40); }
        };
        window.addEventListener('scroll', requestToc, { passive: true });
        window.addEventListener('resize', requestToc);
        window.addEventListener('load', requestToc);
        updateToc();
    }

    // Smooth scroll for anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const offsetTop = targetElement.getBoundingClientRect().top + window.scrollY - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // "Was this page helpful?" feedback (no storage)
    document.querySelectorAll('.content-footer').forEach(footer => {
        const textEl = footer.querySelector('p');
        const buttons = footer.querySelectorAll('.btn-icon');
        if (!textEl || buttons.length < 2) return;

        const [yesBtn, noBtn] = buttons;

        const handleClick = (helpful) => {
            textEl.textContent = helpful
                ? 'Thanks for your feedback!'
                : 'Thanks for your feedback — we’ll use this to improve.';

            [yesBtn, noBtn].forEach(btn => {
                btn.disabled = true;
                btn.classList.add('feedback-submitted');
            });
        };

        yesBtn.addEventListener('click', () => handleClick(true));
        noBtn.addEventListener('click', () => handleClick(false));
    });

    // Sidebar Resizer logic
    const sidebar = document.getElementById('sidebar');
    const resizer = document.getElementById('sidebar-resizer');
    
    // Desktop Sidebar Toggle
    const desktopSidebarToggle = document.getElementById('desktop-sidebar-toggle');
    if (desktopSidebarToggle && sidebar) {
        desktopSidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            if (resizer) {
                resizer.classList.toggle('collapsed');
            }
        });
    }

    if (sidebar && resizer) {
        let isResizing = false;

        resizer.addEventListener('mousedown', (e) => {
            isResizing = true;
            document.body.style.cursor = 'col-resize';
            resizer.classList.add('dragging');
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            const containerOffsetLeft = sidebar.parentElement.getBoundingClientRect().left;
            let newWidth = e.clientX - containerOffsetLeft;
            
            if (newWidth < 200) newWidth = 200;
            if (newWidth > 600) newWidth = 600;
            
            sidebar.style.width = newWidth + 'px';
        });

        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                document.body.style.cursor = '';
                resizer.classList.remove('dragging');
            }
        });
    }
});

class ReadyToScalePromo extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <div class="toc-promo glass-panel">
                <div class="promo-icon"><i class="fa-solid fa-rocket gradient-text"></i></div>
                <h5>Ready to scale?</h5>
                <p>Book a demo with our growth team today.</p>
                <a href="https://cal.com/thrivestack/strategy?duration=45&overlayCalendar=true" class="btn-secondary btn-sm thrivestack-event:ts-demo-booked" target="_blank" rel="noopener noreferrer">Get Started</a>
            </div>
        `;
    }
}
customElements.define('ready-to-scale-promo', ReadyToScalePromo);

/** Which product's docs a path belongs to. The Revenue Intelligence MCP docs live in revenue/mcp/. */
function docsProductFromPath(path) {
    const inRevenueMcp = path.includes('/revenue/mcp/');
    return (path.includes('/cited-by/') || (path.includes('/mcp/') && !inRevenueMcp)) ? 'citedby' : 'thrivestack';
}

/** The MCP changelog covers the whole server, so it belongs to neither product. */
function docsIsSharedMcpPage(path) {
    return path.endsWith('/mcp/changelog.html');
}

/** The product to show for a path; the shared changelog follows the product the reader came from. */
function docsCurrentProduct(path) {
    if (docsIsSharedMcpPage(path)) {
        try {
            return sessionStorage.getItem('docs_product_ctx') === 'thrivestack' ? 'thrivestack' : 'citedby';
        } catch (_) {
            return 'citedby';
        }
    }
    return docsProductFromPath(path);
}

/* ──────────────────────────────────────────────────────────────────────────
 * Docs navigation: one generated sidebar for every page.
 *
 * Every page loads this script, so the sidebar is built here from DOCS_TREES instead of being
 * copied into each HTML file. To add or move a page, edit the tree below: the product block, the
 * collapsible groups, the active-page highlight and the mobile drawer all follow from it.
 * ────────────────────────────────────────────────────────────────────────── */

/** Folder script.js is served from. Every nav href resolves against it, so nested pages need no ../ prefixes. */
const DOCS_BASE_URL = new URL('./', (document.currentScript && document.currentScript.src) || window.location.href).href;

const DOCS_PRODUCTS = [
    { id: 'thrivestack', label: 'ThriveStack', sub: 'Growth intelligence', home: 'index.html' },
    { id: 'citedby', label: 'Cited By', sub: 'AI visibility', home: 'cited-by/introduction.html' },
];

/**
 * The brand marks themselves: logo.png (the ThriveStack wordmark, readable on both themes) and the
 * "ThriveStack citedby" lockup, the same artwork the product's sidebar shows. The lockup comes in two
 * colourways, citedby-logo.png for light and citedby-logo-dark.png for dark; CSS shows the one that
 * matches the theme. Each product row is its logo plus a one-line descriptor.
 */
function docsProductLogo(product, extraClass = '') {
    const image = (file, variant) => {
        const src = docsEsc(new URL(file, DOCS_BASE_URL).href);
        return `<img class="docs-logo docs-logo--${product.id}${variant ? ` docs-logo--${variant}` : ''}${extraClass ? ` ${extraClass}` : ''}" src="${src}" alt="${docsEsc(product.label)}" draggable="false">`;
    };
    return product.id === 'citedby' ? image('citedby-logo.png', 'light') + image('citedby-logo-dark.png', 'dark') : image('logo.png', '');
}

/** The header logo (and its link) follow the product the reader is in. */
function docsApplyHeaderLogo(productId) {
    const link = document.querySelector('.top-nav .nav-left > a.logo');
    const product = DOCS_PRODUCTS.find((p) => p.id === productId);
    if (!link || !product) return;
    link.setAttribute('href', new URL(product.home, DOCS_BASE_URL).href);
    link.innerHTML = docsProductLogo(product, 'docs-header-logo');
}
const docsProductLabel = (product) => `<span class="docs-nav__product-text">${docsProductLogo(product)}<small>${docsEsc(product.sub)}</small></span>`;

const docsLeaf = (title, href, badge) => ({ title, href, badge });
const docsGroup = (title, children) => ({ title, children });

const DOCS_REVENUE_MCP_PAGES = [
    docsLeaf('Introduction', 'revenue/mcp/introduction.html'),
    docsLeaf('Setup', 'revenue/mcp/setup.html'),
    docsLeaf('Use Cases', 'revenue/mcp/use-cases.html'),
    docsLeaf('Prompts', 'revenue/mcp/prompts.html'),
    docsLeaf('Tools', 'revenue/mcp/tools.html'),
];
const DOCS_CITEDBY_MCP_PAGES = [
    docsLeaf('Introduction', 'mcp/introduction.html'),
    docsLeaf('Setup', 'mcp/setup.html'),
    docsLeaf('Use Cases', 'mcp/use-cases.html'),
    docsLeaf('Prompts', 'mcp/prompts.html'),
    docsLeaf('Tools', 'mcp/tools.html'),
];

/** Each product's tree has its own MCP group: that product's MCP pages plus the shared changelog. */
const docsMcpGroup = (pages) => docsGroup('MCP', [...pages, docsLeaf('Changelog', 'mcp/changelog.html')]);

const DOCS_TREES = {
    thrivestack: [
        docsGroup('Get Started', [
            docsLeaf('Overview', 'index.html'),
            docsLeaf('Connect Your Stack', 'connect-your-stack.html'),
            docsLeaf('Analyze Correlated Signals', 'analyze-correlated-signals.html'),
            docsLeaf('Drive Revenue Playbooks', 'drive-revenue-playbooks.html'),
            docsLeaf('Accelerate Free-to-Paid', 'accelerate-free-to-paid.html'),
            docsLeaf('Spot Expansion Signals', 'spot-expansion-signals.html'),
            docsLeaf('Stop Churn Early', 'stop-churn-early.html'),
        ]),
        docsGroup('Setup', [
            docsLeaf('Setup (Unify) Overview', 'setup-overview.html'),
            docsLeaf('Data Collection', 'data-collection.html'),
            docsGroup('Marketing Intelligence', [
                docsLeaf('Setup with AI (LLM)', 'marketing/setup/setup-with-ai.html', '2 mins'),
                docsLeaf('Setup Manually', 'marketing/setup/setup-manually.html', '10 mins'),
                docsLeaf('Implement with Prompt', 'marketing/setup/implement-with-prompt-marketing.html'),
                docsLeaf('Goal Conversion', 'marketing/setup/goal-conversion.html'),
                docsLeaf('Google Ads', 'marketing/setup/google-ads.html'),
            ]),
            docsGroup('Product Intelligence', [
                docsLeaf('Introduction', 'product/setup/introduction.html'),
                docsLeaf('Setup with AI', 'product/setup/setup-with-ai.html', '2 mins'),
                docsLeaf('Multi-Repo & Split Flows', 'product/setup/multi-repo-setup.html'),
                docsLeaf('Setup Manually', 'product/setup/setup-manually.html', '~1hr'),
                docsLeaf('Understand Events Telemetry', 'product/setup/saas-growth-events.html'),
                docsLeaf('Environments and API Keys', 'product/setup/environment-correlation.html'),
                docsLeaf('Advanced AI Instrumentation', 'product/setup/advanced-ai-instrumentation.html', 'Beta'),
                docsLeaf('Track API, CLI & Agent Usage', 'product/setup/api-cli-instrumentation.html'),
            ]),
            docsGroup('Revenue Intelligence', [
                docsLeaf('Introduction', 'revenue/setup/introduction.html'),
                docsLeaf('Setup with AI (LLM)', 'revenue/setup/setup-with-ai.html', '2 mins'),
                docsLeaf('Setup Manually', 'revenue/setup/setup-manually.html', '~1hr'),
                docsLeaf('Chargebee Integration', 'revenue/setup/chargebee-integration.html'),
                docsLeaf('Stripe Integration', 'revenue/setup/stripe-integration.html'),
                docsLeaf('Why Correlation Matters', 'revenue/setup/why-correlation.html'),
                docsLeaf('Exceptional Use Cases', 'revenue/setup/exceptional-use-cases.html'),
            ]),
            docsGroup('CRM Sync', [
                docsLeaf('HubSpot Overview', 'crm-sync/introduction.html'),
                docsLeaf('HubSpot → ThriveStack', 'crm-sync/hubspot-inbound.html'),
                docsLeaf('ThriveStack → HubSpot', 'crm-sync/hubspot-outbound.html'),
            ]),
            docsGroup('Customer Success', [
                docsLeaf('Introduction', 'customer-success/introduction.html'),
                docsLeaf('Setup Health Scores', 'customer-success/setup-health-scores.html'),
            ]),
        ]),
        docsLeaf('Analyze Signals', 'analyze-signals.html'),
        docsGroup('Take Action', [
            docsLeaf('Overview', 'take-action.html'),
            docsLeaf('Account Intelligence', 'account-intelligence.html'),
        ]),
        docsGroup('API Reference', [
            docsLeaf('Overview', 'api-reference.html'),
            docsGroup('Telemetry', [
                docsLeaf('Identify', 'api/identify.html'),
                docsLeaf('Group', 'api/group.html'),
                docsLeaf('Track', 'api/track.html'),
            ]),
            docsGroup('Revenue Intelligence', [
                docsLeaf('Subscriptions', 'api/subscriptions.html'),
                docsLeaf('Subscription Items', 'api/subscription-items.html'),
                docsLeaf('Invoices', 'api/invoices.html'),
                docsLeaf('Transactions', 'api/transactions.html'),
            ]),
            docsGroup('Growth Intelligence', [
                docsLeaf('GetSegments', 'api/get-segments.html'),
                docsLeaf('GetAccounts', 'api/get-accounts.html'),
                docsLeaf('GetAccountById', 'api/get-account-by-id.html'),
                docsLeaf('GetUsers', 'api/get-users.html'),
                docsLeaf('GetUserById', 'api/get-user-by-id.html'),
                docsLeaf('GetAccountEnrichment', 'api/get-account-enrichment.html'),
                docsLeaf('GetUserEnrichment', 'api/get-user-enrichment.html'),
            ]),
        ]),
        docsMcpGroup(DOCS_REVENUE_MCP_PAGES),
        docsLeaf('Startup Cohort Discount', 'startup-cohort-discount.html'),
    ],
    citedby: [
        docsLeaf('Introduction', 'cited-by/introduction.html'),
        docsGroup('AI Crawl Attribution', [
            docsLeaf('Connect Vercel', 'cited-by/ai-crawl-attribution-vercel.html'),
            docsLeaf('Connect WordPress', 'cited-by/ai-crawl-attribution-wordpress.html'),
        ]),
        docsMcpGroup(DOCS_CITEDBY_MCP_PAGES),
        docsGroup('Prompts', [
            docsLeaf('Bulk import', 'cited-by/prompts-bulk-import.html'),
        ]),
    ],
};

const DOCS_NAV_STORE_KEY = 'docs_nav_state';

const docsEsc = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const docsSlug = (value) => String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** A directory URL is served by its index.html, so compare paths with that filled in. */
const docsNormalizePath = (path) => (path.endsWith('/') ? `${path}index.html` : path);
const docsLeafPath = (leaf) => new URL(leaf.href, DOCS_BASE_URL).pathname;

function docsHasActive(node, activePath) {
    return node.children ? node.children.some((child) => docsHasActive(child, activePath)) : docsLeafPath(node) === activePath;
}

/** Open/closed choices the reader made by hand, as { groupId: boolean }. The group holding the current page always opens. */
function docsReadNavState() {
    try {
        const saved = JSON.parse(localStorage.getItem(DOCS_NAV_STORE_KEY) || '{}');
        return saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
    } catch (_) {
        return {};
    }
}

function docsWriteNavState(saved) {
    try {
        localStorage.setItem(DOCS_NAV_STORE_KEY, JSON.stringify(saved));
    } catch (_) { /* storage unavailable: the nav still works, it just forgets */ }
}

function docsRenderLeaf(leaf, activePath) {
    const url = new URL(leaf.href, DOCS_BASE_URL);
    const active = url.pathname === activePath;
    const badge = leaf.badge ? `<span class="time-badge${leaf.badge === 'Beta' ? ' time-badge--beta' : ''}">${docsEsc(leaf.badge)}</span>` : '';
    return `<a class="docs-nav__link${active ? ' is-active' : ''}" href="${docsEsc(url.href)}"${active ? ' aria-current="page"' : ''}><span>${docsEsc(leaf.title)}</span>${badge}</a>`;
}

function docsRenderNodes(nodes, state, parentId) {
    return nodes.map((node) => {
        if (!node.children) return docsRenderLeaf(node, state.activePath);
        const id = parentId ? `${parentId}/${node.title}` : node.title;
        const open = docsHasActive(node, state.activePath) || state.saved[id] === true;
        const panelId = `docs-nav-panel-${docsSlug(id)}`;
        return `<div class="docs-nav__group">
            <button type="button" class="docs-nav__toggle" data-group="${docsEsc(id)}" aria-expanded="${open}" aria-controls="${panelId}"><span>${docsEsc(node.title)}</span><i class="fa-solid fa-chevron-right docs-nav__chev" aria-hidden="true"></i></button>
            <div class="docs-nav__panel" id="${panelId}"${open ? '' : ' hidden'}>${docsRenderNodes(node.children, state, id)}</div>
        </div>`;
    }).join('');
}

function docsRenderProducts(currentId) {
    const rows = DOCS_PRODUCTS.map((product) => {
        const current = product.id === currentId;
        return `<a class="docs-nav__product${current ? ' is-current' : ''}" href="${docsEsc(new URL(product.home, DOCS_BASE_URL).href)}"${current ? ' aria-current="true"' : ''}>
            ${docsProductLabel(product)}
            <i class="fa-solid ${current ? 'fa-check' : 'fa-arrow-right'} docs-nav__product-mark" aria-hidden="true"></i>
        </a>`;
    }).join('');
    return `<div class="docs-nav__products"><p class="docs-nav__caption">Products</p>${rows}</div>`;
}

/** Hamburger opens the sidebar as a drawer on narrow screens, where it is otherwise hidden. */
function docsBindMobileDrawer() {
    const button = document.querySelector('.mobile-menu-btn');
    if (!button) return;

    const scrim = document.createElement('div');
    scrim.className = 'docs-nav-scrim';
    scrim.hidden = true;
    document.body.appendChild(scrim);

    button.setAttribute('aria-controls', 'sidebar');
    const setOpen = (open) => {
        document.body.classList.toggle('docs-nav-open', open);
        scrim.hidden = !open;
        button.setAttribute('aria-expanded', String(open));
        button.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    };
    setOpen(false);

    button.addEventListener('click', () => setOpen(!document.body.classList.contains('docs-nav-open')));
    scrim.addEventListener('click', () => setOpen(false));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
    window.matchMedia('(min-width: 769px)').addEventListener('change', (e) => { if (e.matches) setOpen(false); });
}

function mountDocsShell() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar || sidebar.dataset.docsNav === '1') return;

    const path = window.location.pathname || '';
    const product = docsCurrentProduct(path);
    // Remember the product for the shared changelog page, which follows the reader's product.
    if (!docsIsSharedMcpPage(path)) {
        try { sessionStorage.setItem('docs_product_ctx', product); } catch (_) { /* ignore */ }
    }

    const state = { activePath: docsNormalizePath(path), saved: docsReadNavState() };
    sidebar.innerHTML = `<nav class="docs-nav" aria-label="Documentation">
        ${docsRenderProducts(product)}
        <div class="docs-nav__rule"></div>
        <div class="docs-nav__tree">${docsRenderNodes(DOCS_TREES[product], state, '')}</div>
        <a class="docs-nav__signin" href="https://app.thrivestack.ai/auth/customer-analytics/sign-up" target="_blank" rel="noopener noreferrer">Sign in</a>
    </nav>`;
    sidebar.dataset.docsNav = '1';
    docsApplyHeaderLogo(product);
    // The header links now live in the sidebar, so the header keeps only logo, search, theme and sign-in.
    document.documentElement.classList.add('docs-nav-on');

    sidebar.addEventListener('click', (e) => {
        const toggle = e.target.closest('.docs-nav__toggle');
        if (!toggle) return;
        const open = toggle.getAttribute('aria-expanded') !== 'true';
        toggle.setAttribute('aria-expanded', String(open));
        document.getElementById(toggle.getAttribute('aria-controls')).hidden = !open;
        docsWriteNavState({ ...docsReadNavState(), [toggle.dataset.group]: open });
    });

    docsBindMobileDrawer();

    const active = sidebar.querySelector('.docs-nav__link.is-active');
    if (active) sidebar.scrollTop = Math.max(0, active.offsetTop - sidebar.clientHeight / 3);
}
