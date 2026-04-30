document.addEventListener('DOMContentLoaded', () => {
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
                url: 'analyze-signals.html#overview',
                terms: 'analyze signals identify high-intent signals account intelligence bow-tie revenue model analyze revenue & churn churn prediction revenue analytics nrr waterfall cac payback ltv/cac expansion'
            },
            {
                title: 'Take Action',
                url: 'take-action.html#overview',
                terms: 'take action automate workflow responses act on signals automated workflow engine signal detected action triggered slack alert account owner'
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
                url: 'saas-growth-events.html#saas-growth-events',
                terms: 'journey to event bow tie phases telemetry mapping'
            },
            {
                title: 'Vibe Analytics (AI)',
                url: 'vibe-analytics.html#vibe-analytics',
                terms: 'vibe analytics ai telemetry spec identify group track checklist'
            },
            {
                title: 'Configure ThriveStack MCP Server',
                url: 'public/product/setup/thrivestack-mcp-server.html#capabilities',
                terms: 'thrivestack mcp setup model context protocol remote server tools capabilities example prompts marketing product revenue tool oriented reference correlated metrics get_mau_mtu_count get_event_count list_accounts get_plg_leads get_setup_status getVisitor getPageViews getSignup acquisition conversion mrr stickiness dau wau mau activation churn expansion implementation'
            },
            {
                title: 'API Reference',
                url: 'api-reference.html#overview',
                terms: 'api reference public endpoints rest http authentication bearer key'
            },
            {
                title: 'Identify Endpoint',
                url: 'public/api/identify.html#identify',
                terms: 'identify user traits email name user_id context group_id device_id session_id'
            },
            {
                title: 'Group Endpoint',
                url: 'public/api/group.html#group',
                terms: 'group account traits group_id user_id account_name account_domain group_type'
            },
            {
                title: 'Track Endpoint',
                url: 'public/api/track.html#track',
                terms: 'track event signed_up account_created feature_used invite_sent page_visit onboarding event_name properties'
            },
            {
                title: 'GetAccountById',
                url: 'public/api/get-account-by-id.html#get-account-by-id',
                terms: 'get account by id graphql growth intelligence acquisition activation monetization engagement firmographics mrr arr dau mau'
            },
            {
                title: 'GetUserById',
                url: 'public/api/get-user-by-id.html#get-user-by-id',
                terms: 'get user by id graphql growth intelligence acquisition engagement demographics employment title role signin'
            },
            {
                title: 'GetAccountEnrichment',
                url: 'public/api/get-account-enrichment.html#get-account-enrichment',
                terms: 'get account enrichment graphql domain firmographic industry employees revenue technology stack social linkedin twitter'
            },
            {
                title: 'GetUserEnrichment',
                url: 'public/api/get-user-enrichment.html#get-user-enrichment',
                terms: 'get user enrichment graphql email job title role seniority company linkedin social profiles location personalize onboarding'
            },
            {
                title: 'Transactions API',
                url: 'public/api/transactions.html#transactions',
                terms: 'transactions revenue billing crud create list get update delete payment amount currency status charge refund credit'
            },
            {
                title: 'Invoices API',
                url: 'public/api/invoices.html#invoices',
                terms: 'invoices billing revenue crud create list get update void due_date line_items total draft open paid'
            },
            {
                title: 'Subscriptions API',
                url: 'public/api/subscriptions.html#subscriptions',
                terms: 'subscriptions billing recurring revenue crud create list get update cancel plan interval status trial active past_due'
            },
            {
                title: 'Exceptional Use Cases',
                url: 'public/revenue/setup/exceptional-use-cases.html#exceptional-use-cases',
                terms: 'exceptional use cases chargebee stripe payment gateway marketplace platform fee revenue billing connect transactions api'
            },
            {
                title: 'Goal Conversion',
                url: 'public/marketing/setup/goal-conversion.html#create-goal',
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

    // ScrollSpy for Table of Contents
    const sections = document.querySelectorAll('.content-section');
    const navLinks = document.querySelectorAll('.toc-link');

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -60% 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                // Remove active from all
                navLinks.forEach(link => link.classList.remove('active'));
                
                // Add active to current
                const activeLink = document.querySelector(`.toc-link[href="#${id}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });

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

class SetupSidebar extends HTMLElement {
    connectedCallback() {
        const prefix = this.getAttribute('base-path') || '';
        this.innerHTML = `
            <div class="sidebar-section">
                <h3>Overview</h3>
                <ul>
                    <li><a href="${prefix}setup-overview.html" class="nav-item"><span>Setup (Unify) Overview</span></a></li>
                    <li><a href="${prefix}data-collection.html" class="nav-item"><span>Data Collection</span></a></li>
                </ul>
            </div>

            <div class="sidebar-section">
                <h3>ThriveStack MCP</h3>
                <ul>
                    <li><a href="${prefix}public/product/setup/thrivestack-mcp-server.html" class="nav-item"><span>Configure ThriveStack MCP Server</span></a></li>
                </ul>
            </div>

            <div class="sidebar-section">
                <h3>Marketing Intelligence</h3>
                <ul>
                    <li><a href="${prefix}public/marketing/setup/setup-with-ai.html" class="nav-item"><span>Setup with AI (LLM)</span><span class="time-badge">2 mins</span></a></li>
                    <li><a href="#" class="nav-item"><span>Setup Manually</span><span class="time-badge">10 mins</span></a></li>
                    <li><a href="${prefix}public/marketing/setup/implement-with-prompt-marketing.html" class="nav-item"><span>Implement with Prompt</span></a></li>
                    <li><a href="${prefix}public/marketing/setup/goal-conversion.html" class="nav-item"><span>Goal Conversion</span></a></li>
                    <li><a href="${prefix}public/marketing/setup/google-ads.html" class="nav-item"><span>Google Ads</span></a></li>
                </ul>
            </div>

            <div class="sidebar-section">
                <h3>Product Intelligence</h3>
                <ul>
                    <li><a href="${prefix}public/product/setup/introduction.html" class="nav-item"><span>Introduction</span></a></li>
                    <li><a href="${prefix}public/product/setup/setup-with-ai.html" class="nav-item"><span>Setup with AI</span><span class="time-badge">2 mins</span></a></li>
                    <li><a href="${prefix}public/product/setup/multi-repo-setup.html" class="nav-item"><span>Multi-Repo &amp; Split Flows</span></a></li>
                    <li><a href="${prefix}public/product/setup/setup-manually.html" class="nav-item"><span>Setup Manually</span><span class="time-badge">~1hr</span></a></li>
                    <li><a href="${prefix}public/product/setup/saas-growth-events.html" class="nav-item"><span>Understand Events Telemetry</span></a></li>
                    <li><a href="${prefix}public/revenue/setup/why-correlation.html" class="nav-item"><span>Why Correlation Matters</span></a></li>
                    <li><a href="${prefix}public/product/setup/environment-correlation.html" class="nav-item"><span>Environments and API Keys</span></a></li>
                    <li><a href="${prefix}public/product/setup/advanced-ai-instrumentation.html" class="nav-item"><span>Advanced AI Instrumentation</span><span class="time-badge" style="background:rgba(99,102,241,0.15);color:#818cf8;">Beta</span></a></li>
                    <li><a href="${prefix}public/product/setup/api-cli-instrumentation.html" class="nav-item"><span>Track API, CLI &amp; Agent Usage</span></a></li>
                </ul>
            </div>

            <div class="sidebar-section">
                <h3>Revenue Intelligence</h3>
                <ul>
                    <li><a href="${prefix}public/revenue/setup/introduction.html" class="nav-item"><span>Introduction</span></a></li>
                    <li><a href="${prefix}public/revenue/setup/setup-with-ai.html" class="nav-item"><span>Setup with AI (LLM)</span><span class="time-badge">2 mins</span></a></li>
                    <li><a href="${prefix}public/revenue/setup/setup-manually.html" class="nav-item"><span>Setup Manually</span><span class="time-badge">~1hr</span></a></li>
                    <li><a href="${prefix}public/revenue/setup/chargebee-integration.html" class="nav-item"><span>Chargebee Integration</span></a></li>
                    <li><a href="${prefix}public/revenue/setup/stripe-integration.html" class="nav-item"><span>Stripe Integration</span></a></li>
                    <li><a href="${prefix}public/revenue/setup/why-correlation.html" class="nav-item"><span>Why Correlation Matters</span></a></li>
                    <li><a href="${prefix}public/revenue/setup/exceptional-use-cases.html" class="nav-item"><span>Exceptional Use Cases</span></a></li>
                </ul>
            </div>

            <div class="sidebar-section">
                <h3>CRM Sync</h3>
                <ul>
                    <li><a href="${prefix}public/crm-sync/introduction.html" class="nav-item"><span>Introduction</span></a></li>
                    <li><a href="${prefix}public/crm-sync/hubspot.html" class="nav-item"><span>HubSpot</span></a></li>
                </ul>
            </div>

            <div class="sidebar-section">
                <h3>Customer Success</h3>
                <ul>
                    <li><a href="${prefix}public/customer-success/introduction.html" class="nav-item"><span>Introduction</span></a></li>
                    <li><a href="${prefix}public/customer-success/setup-health-scores.html" class="nav-item"><span>Setup Health Scores</span></a></li>
                </ul>
            </div>
        `;
        
        // Handle Active State
        let currentPath = window.location.pathname;
        if (currentPath.endsWith('/')) {
            currentPath += 'index.html';
        }
        
        const links = this.querySelectorAll('a.nav-item');
        const currentFile = currentPath.split('/').pop();
        const isMarketing = currentPath.includes('marketing');
        const isProduct = currentPath.includes('product');
        const isRevenue = currentPath.includes('revenue');
        const isCRM = currentPath.includes('crm-sync');
        const isCS = currentPath.includes('customer-success');

        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href !== '#') {
                const hrefPath = href.split('/').pop();
                
                if (hrefPath === currentFile) {
                    if (hrefPath === 'setup-with-ai.html' || hrefPath === 'setup-manually.html') {
                        if (isMarketing && href.includes('marketing')) link.classList.add('active');
                        else if (isProduct && href.includes('product')) link.classList.add('active');
                        else if (isRevenue && href.includes('revenue')) link.classList.add('active');
                    } else if (hrefPath === 'introduction.html') {
                        if (isProduct && href.includes('product')) link.classList.add('active');
                        else if (isRevenue && href.includes('revenue')) link.classList.add('active');
                        else if (isCRM && href.includes('crm-sync')) link.classList.add('active');
                        else if (isCS && href.includes('customer-success')) link.classList.add('active');
                    } else {
                        link.classList.add('active');
                    }
                }
            }
        });
    }
}
customElements.define('setup-sidebar', SetupSidebar);

