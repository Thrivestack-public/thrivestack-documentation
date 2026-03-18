document.addEventListener('DOMContentLoaded', () => {
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
                <a href="https://cal.com/thrivestack/strategy?duration=45&overlayCalendar=true" class="btn-secondary btn-sm" target="_blank" rel="noopener noreferrer">Get Started</a>
            </div>
        `;
    }
}
customElements.define('ready-to-scale-promo', ReadyToScalePromo);
