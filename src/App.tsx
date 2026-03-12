import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import {
  Search,
  Menu,
  X,
  BarChart3,
  Activity,
  RefreshCw,
  Cpu,
  ExternalLink,
  Github,
  ArrowRight,
  Terminal,
  Code2,
  Database,
  Globe,
  Sparkles,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { DOCS, DocSection } from './data/docs';

const Sidebar = ({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (v: boolean) => void }) => {
  const location = useLocation();
  const categories = Array.from(new Set(DOCS.map(doc => doc.category)));

  if (location.pathname === '/') return null;

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-100 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="h-full flex flex-col">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <Link to="/" className="flex items-center" onClick={() => setIsOpen(false)}>
            <img src="/logo.png" alt="ThriveStack" className="h-8 w-auto" />
          </Link>
          <button onClick={() => setIsOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
          {categories.map(category => (
            <div key={category}>
              <h3 className="px-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                {category}
              </h3>
              <ul className="space-y-1">
                {DOCS.filter(doc => doc.category === category).map(doc => {
                  const isActive = location.pathname === `/docs/${doc.id}`;
                  return (
                    <li key={doc.id}>
                      <Link
                        to={`/docs/${doc.id}`}
                        onClick={() => setIsOpen(false)}
                        className={`
                          flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                          ${isActive 
                            ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                        `}
                      >
                        {doc.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-50">
          <a 
            href="https://thrivestack.ai" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-between px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors group"
          >
            Main Website
            <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>
      </div>
    </aside>
  );
};

const Header = ({ setIsOpen }: { setIsOpen: (v: boolean) => void }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<DocSection[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const filtered = DOCS.filter(doc => 
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setResults(filtered.slice(0, 5));
    } else {
      setResults([]);
    }
  }, [searchQuery]);

  return (
    <header className={`sticky top-0 z-40 w-full backdrop-blur-md border-b border-slate-100 transition-colors ${location.pathname === '/' ? 'bg-white/50' : 'bg-white/80'}`}>
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {location.pathname !== '/' && (
            <button 
              onClick={() => setIsOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}
          
          {location.pathname === '/' && (
            <Link to="/">
              <img src="/logo.png" alt="ThriveStack" className="h-8 w-auto" />
            </Link>
          )}

          <div className="relative hidden md:block ml-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              placeholder="Search documentation..." 
              className="w-64 lg:w-96 pl-10 pr-4 py-2 bg-slate-100/50 border-none rounded-full text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />

            <AnimatePresence>
              {isFocused && searchQuery.trim().length > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full mt-2 w-full bg-white border border-slate-100 rounded-xl shadow-2xl overflow-hidden"
                >
                  <div className="p-2">
                    {results.length > 0 ? (
                      results.map(result => (
                        <Link
                          key={result.id}
                          to={`/docs/${result.id}`}
                          onClick={() => setSearchQuery('')}
                          className="flex flex-col p-3 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-1">
                            {result.category}
                          </span>
                          <span className="text-sm font-semibold text-slate-900">
                            {result.title}
                          </span>
                        </Link>
                      ))
                    ) : (
                      <div className="p-4 text-center">
                        <p className="text-sm text-slate-500 font-medium">No results found for "{searchQuery}"</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <nav className="hidden lg:flex items-center gap-6">
            <Link to="/docs/introduction" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">Documentation</Link>
            <Link to="/docs/event-tracking" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">SDKs</Link>
            <Link to="/docs/events" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">API Reference</Link>
          </nav>
          <div className="h-4 w-px bg-slate-200 hidden lg:block" />
          <a 
            href="https://app.thrivestack.ai" 
            className="px-5 py-2 bg-slate-900 text-white text-sm font-bold rounded-full hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-200 transition-all"
          >
            Log in
          </a>
        </div>
      </div>
    </header>
  );
};

const DocPage = () => {
  const location = useLocation();
  const id = location.pathname.split('/').pop();
  const doc = DOCS.find(d => d.id === id) || DOCS[0];

  return (
    <motion.div
      key={doc.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="max-w-4xl mx-auto py-16 px-8 lg:px-12"
    >
      <div className="mb-8">
        <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2 block">
          {doc.category}
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          {doc.title}
        </h1>
        {doc.description && (
          <p className="mt-4 text-lg text-slate-500 leading-relaxed font-medium">
            {doc.description}
          </p>
        )}
      </div>

      <div className="markdown-body prose prose-slate max-w-none">
        <Markdown remarkPlugins={[remarkGfm]}>{doc.content}</Markdown>
      </div>

      <div className="mt-20 pt-10 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="text-sm font-medium text-slate-400">
          Last updated: March 2026
        </div>
        <div className="flex items-center gap-6">
          <button className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
            <Github className="w-4 h-4" />
            Edit on GitHub
          </button>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-500">Helpful?</span>
            <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-400 hover:text-indigo-600">Yes</button>
            <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-400 hover:text-indigo-600">No</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Home = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-20 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-50" />
        </div>
        
        <div className="max-w-6xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-widest mb-8 border border-indigo-100"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Vibe Analytics is now in Beta
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 leading-[1.1]"
          >
            Build your growth <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">intelligence engine.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-500 max-w-3xl mx-auto leading-relaxed mb-12 font-medium"
          >
            Comprehensive guides and resources to help you unify your GTM, Product, 
            and Revenue data into a single source of truth.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Link 
              to="/docs/introduction" 
              className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-200 transition-all flex items-center gap-2"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/docs/events"
              className="px-8 py-4 bg-white text-slate-900 font-bold rounded-2xl border border-slate-200 hover:border-indigo-600 hover:text-indigo-600 transition-all flex items-center gap-2"
            >
              API Reference
              <Terminal className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-24 px-6 bg-slate-50/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Database,
                title: "Getting Started",
                desc: "New to ThriveStack? Start here to understand the core concepts and setup.",
                link: "/docs/introduction",
                color: "bg-blue-500"
              },
              { 
                icon: Code2, 
                title: "SDKs & Libraries", 
                desc: "Implementation guides for JavaScript, Node.js, Python, and Go.",
                link: "/docs/event-tracking",
                color: "bg-indigo-500"
              },
              { 
                icon: BarChart3, 
                title: "Product Intelligence", 
                desc: "Analyze product activation, retention, and habit formation signals.",
                link: "/docs/product-intelligence",
                color: "bg-emerald-500"
              },
              { 
                icon: Target, 
                title: "Marketing Intelligence", 
                desc: "Connect marketing spend to product activation and revenue ROI.",
                link: "/docs/marketing-intelligence",
                color: "bg-cyan-500"
              },
              { 
                icon: RefreshCw, 
                title: "CRM & GTM Sync", 
                desc: "Connect your growth signals to Salesforce, HubSpot, and Slack.",
                link: "/docs/crm-syncs",
                color: "bg-orange-500"
              },
              { 
                icon: Cpu, 
                title: "AI & Vibe Analytics", 
                desc: "Leverage AI to understand customer sentiment and usage patterns.",
                link: "/docs/vibe-analytics",
                color: "bg-purple-500"
              },
              { 
                icon: Database, 
                title: "Revenue Intelligence", 
                desc: "Unify billing and usage data to predict and drive revenue growth.",
                link: "/docs/revenue-intelligence",
                color: "bg-rose-500"
              },
            ].map((card, i) => (
              <Link 
                key={i} 
                to={card.link}
                className="group p-8 bg-white border border-slate-100 rounded-3xl hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-14 h-14 ${card.color} rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-opacity-20`}>
                  <card.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">{card.title}</h3>
                <p className="text-slate-500 leading-relaxed font-medium mb-6">{card.desc}</p>
                <div className="flex items-center gap-2 text-sm font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-all">
                  Explore
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Resources */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Popular Resources</h2>
            <Link to="/docs/introduction" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-2">
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-10 bg-slate-900 rounded-[2.5rem] text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:scale-110 transition-transform duration-500" />
              <div className="relative z-10">
                <Terminal className="w-10 h-10 text-indigo-400 mb-8" />
                <h3 className="text-2xl font-bold mb-4">API Reference</h3>
                <p className="text-slate-400 text-lg mb-8 leading-relaxed font-medium">
                  Detailed documentation for our REST APIs, including authentication, 
                  endpoints, and response schemas.
                </p>
                <Link to="/docs/events" className="inline-block px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors">
                  Explore API
                </Link>
              </div>
            </div>
            
            <div className="p-10 bg-indigo-600 rounded-[2.5rem] text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:scale-110 transition-transform duration-500" />
              <div className="relative z-10">
                <Globe className="w-10 h-10 text-indigo-200 mb-8" />
                <h3 className="text-2xl font-bold mb-4">SDK Guides</h3>
                <p className="text-indigo-100 text-lg mb-8 leading-relaxed font-medium">
                  Step-by-step implementation guides for all major platforms 
                  and frameworks.
                </p>
                <Link to="/docs/event-tracking" className="inline-block px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors">
                  View SDKs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Integrations */}
      <section className="py-24 px-6 bg-slate-50/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-4">Connect Your Stack</h2>
            <p className="text-lg text-slate-500 font-medium">Native integrations with the tools you already use.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "Stripe", id: "stripe", icon: "💳" },
              { name: "HubSpot", id: "hubspot", icon: "🧡" },
              { name: "Chargebee", id: "chargebee", icon: "🐝" },
              { name: "Salesforce", id: "crm-syncs", icon: "☁️" },
            ].map((item) => (
              <Link 
                key={item.id}
                to={`/docs/${item.id}`}
                className="flex flex-col items-center p-8 bg-white border border-slate-100 rounded-3xl hover:shadow-xl hover:-translate-y-1 transition-all group"
              >
                <div className="text-4xl mb-4 grayscale group-hover:grayscale-0 transition-all duration-300">
                  {item.icon}
                </div>
                <span className="font-bold text-slate-900">{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-slate-100 bg-slate-50/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            <div>
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6">Product</h4>
              <ul className="space-y-4">
                <li><a href="https://thrivestack.ai/#features" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">Features</a></li>
                <li><Link to="/docs/crm-syncs" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">Integrations</Link></li>
                <li><a href="https://thrivestack.ai/pricing" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">Pricing</a></li>
                <li><a href="https://thrivestack.ai/blog" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6">Resources</h4>
              <ul className="space-y-4">
                <li><Link to="/docs/introduction" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">Documentation</Link></li>
                <li><Link to="/docs/events" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">API Reference</Link></li>
                <li><a href="https://thrivestack.ai/community" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">Community</a></li>
                <li><a href="mailto:support@thrivestack.ai" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6">Company</h4>
              <ul className="space-y-4">
                <li><a href="https://thrivestack.ai/about" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">About Us</a></li>
                <li><a href="https://thrivestack.ai/careers" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">Careers</a></li>
                <li><a href="https://thrivestack.ai/blog" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">Blog</a></li>
                <li><a href="mailto:hello@thrivestack.ai" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6">Legal</h4>
              <ul className="space-y-4">
                <li><a href="https://thrivestack.ai/privacy" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">Privacy Policy</a></li>
                <li><a href="https://thrivestack.ai/terms" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">Terms of Service</a></li>
                <li><a href="https://thrivestack.ai/security" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-12 border-t border-slate-100">
            <div className="flex items-center">
              <img src="/logo.png" alt="ThriveStack" className="h-7 w-auto" />
            </div>
            <p className="text-sm font-medium text-slate-400">
              © 2026 ThriveStack Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="flex min-h-screen bg-white font-sans selection:bg-indigo-100 selection:text-indigo-900">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        
        <div className="flex-1 flex flex-col min-w-0">
          <Header setIsOpen={setIsSidebarOpen} />
          
          <main className="flex-1 overflow-y-auto custom-scrollbar">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/docs/:id" element={<DocPage />} />
              <Route path="/docs" element={<Navigate to="/docs/introduction" replace />} />
            </Routes>
          </main>
        </div>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm lg:hidden"
            />
          )}
        </AnimatePresence>
      </div>
    </Router>
  );
}

