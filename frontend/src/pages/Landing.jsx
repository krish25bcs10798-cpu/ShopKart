import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import { getProducts } from "../services/api";

export default function Landing() {
  const [curatedSpotlightCatalog, setCuratedSpotlightCatalog] = useState([]);
  const [isSpotlightLoading, setIsSpotlightLoading] = useState(true);
  const [newsletterEmailInput, setNewsletterEmailInput] = useState("");
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  useEffect(() => {
    let activeComponent = true;
    const fetchSpotlightItems = async () => {
      try {
        const catalogResponse = await getProducts();
        if (activeComponent && catalogResponse?.success && Array.isArray(catalogResponse.products)) {
          setCuratedSpotlightCatalog(catalogResponse.products.slice(0, 8));
        }
      } catch (networkError) {
        console.error("Failed to fetch spotlight artifacts:", networkError);
      } finally {
        if (activeComponent) setIsSpotlightLoading(false);
      }
    };

    fetchSpotlightItems();
    return () => {
      activeComponent = false;
    };
  }, []);

  const productCategoryTaxonomy = [
    {
      name: "Electronics",
      tagline: "Acoustic engineering & tactile mechanical gear",
      count: "12 Artifacts",
      icon: "⚡",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
    },
    {
      name: "Fashion",
      tagline: "Timeless silhouettes & structured heavyweight textiles",
      count: "11 Pieces",
      icon: "🧥",
      image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80",
    },
    {
      name: "Home & Living",
      tagline: "Wheel-thrown ceramics & architectural warm illumination",
      count: "11 Objects",
      icon: "🏺",
      image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80",
    },
    {
      name: "Books",
      tagline: "Enduring volumes on industrial design & software craft",
      count: "6 Titles",
      icon: "📚",
      image: "https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=800&auto=format&fit=crop&q=80",
    },
  ];

  const handleNewsletterSubscription = (e) => {
    e.preventDefault();
    if (!newsletterEmailInput) return;
    setNewsletterSubmitted(true);
    setNewsletterEmailInput("");
    setTimeout(() => setNewsletterSubmitted(false), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      {/* --- HERO SHOWCASE SECTION --- */}
      <section className="relative overflow-hidden pt-10 pb-16 sm:pt-16 sm:pb-24 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Narrative Column */}
            <div className="lg:col-span-7 flex flex-col items-start pr-0 lg:pr-6 z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/80 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-indigo-700 mb-6 shadow-2xs">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse" />
                Autumn / Winter 2026 Collection
              </div>

              <h1 className="font-serif-editorial text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[1.08]">
                Everyday essentials. <br />
                <span className="italic font-normal text-slate-500">
                  Extraordinary craft.
                </span>
              </h1>

              <p className="mt-6 text-base sm:text-lg leading-relaxed text-slate-600 max-w-xl">
                Discover thoughtfully engineered pieces designed to complement your lifestyle,
                elevate your creative environment, and bring quiet elegance to your daily rituals.
              </p>

              {/* Primary Call-to-Actions */}
              <div className="mt-8 sm:mt-10 flex flex-wrap items-center gap-4 w-full sm:w-auto">
                <Link
                  to="/products"
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-indigo-600 px-7 py-3.5 text-sm font-bold text-white shadow-md shadow-indigo-600/25 transition hover:bg-indigo-700 active:scale-98"
                >
                  Explore 50+ Products
                </Link>
                <Link
                  to="/products?category=Electronics"
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white/90 px-6 py-3.5 text-sm font-semibold text-slate-800 transition hover:bg-white hover:border-slate-300 active:scale-98 shadow-xs"
                >
                  ⚡ Studio Electronics
                </Link>
              </div>

              {/* Guarantees Ribbon */}
              <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 gap-6 pt-8 border-t border-slate-200/80 w-full text-xs text-slate-500">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    ✓
                  </div>
                  <span>100% Authentic Guaranteed</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    ⚡
                  </div>
                  <span>Complimentary Shipping &gt; ₹999</span>
                </div>
                <div className="flex items-center gap-2.5 col-span-2 sm:col-span-1">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    🛡️
                  </div>
                  <span>Cryptographic Razorpay</span>
                </div>
              </div>
            </div>

            {/* Right Editorial Hero Canvas */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none overflow-hidden rounded-3xl lux-card shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"
                  alt="Studio Wireless Headphones"
                  className="w-full aspect-4/5 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex flex-col justify-end p-6 sm:p-8 text-white">
                  <span className="lux-badge rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-800 self-start mb-2 bg-white/90">
                    Spotlight Highlight
                  </span>
                  <h3 className="font-serif-editorial text-2xl font-bold">
                    Studio Pro Wireless Acoustics
                  </h3>
                  <p className="mt-1 text-xs text-slate-200 line-clamp-2">
                    Adaptive noise cancellation, 40-hour lossless playback, and CNC aluminum hinges.
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-serif-editorial text-lg font-bold">₹14,999</span>
                    <Link
                      to="/products"
                      className="rounded-lg bg-white/90 backdrop-blur-xs px-3 py-1.5 text-xs font-bold text-slate-900 hover:bg-white transition"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CURATED DISCIPLINES / CATEGORIES RAIL --- */}
      <section className="py-16 sm:py-20 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-600">
                Curated Disciplines
              </span>
              <h2 className="mt-1 font-serif-editorial text-3xl sm:text-4xl font-bold text-slate-900">
                Shop by Categorical Realm
              </h2>
            </div>
            <Link
              to="/products"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1"
            >
              Browse Complete Store Catalog →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {productCategoryTaxonomy.map((categoryEntity) => (
              <Link
                key={categoryEntity.name}
                to={`/products?category=${encodeURIComponent(categoryEntity.name)}`}
                className="group relative flex flex-col overflow-hidden rounded-2xl lux-card"
              >
                <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-100">
                  <img
                    src={categoryEntity.image}
                    alt={categoryEntity.name}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                  <span className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-sm shadow-xs">
                    {categoryEntity.icon}
                  </span>
                  <div className="absolute bottom-3 left-3 text-white">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                      {categoryEntity.count}
                    </span>
                    <h3 className="font-serif-editorial text-lg font-bold">
                      {categoryEntity.name}
                    </h3>
                  </div>
                </div>
                <div className="p-4 bg-white">
                  <p className="text-xs text-slate-500 line-clamp-1">
                    {categoryEntity.tagline}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* --- FEATURED SPOTLIGHT CATALOG --- */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-600">
                Curated Spotlight
              </span>
              <h2 className="mt-1 font-serif-editorial text-3xl sm:text-4xl font-bold text-slate-900">
                Selected Artifacts of the Season
              </h2>
            </div>
            <Link
              to="/products"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition"
            >
              View All 50+ Products →
            </Link>
          </div>

          {isSpotlightLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((skeletonIndex) => (
                <div key={skeletonIndex} className="aspect-4/3 rounded-2xl bg-slate-200 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {curatedSpotlightCatalog.map((productRecord) => (
                <ProductCard key={productRecord._id} product={productRecord} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* --- NEWSLETTER SUBSCRIPTION CALLOUT --- */}
      <section className="py-16 bg-slate-900 text-white border-t border-slate-800">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
            Dispatch Digest
          </span>
          <h2 className="mt-2 font-serif-editorial text-3xl sm:text-4xl font-bold">
            Join the Architectural Living Collective
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            Receive private releases, limited edition runs, and architectural design profiles directly to your inbox.
          </p>

          <form onSubmit={handleNewsletterSubscription} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              required
              value={newsletterEmailInput}
              onChange={(e) => setNewsletterEmailInput(e.target.value)}
              placeholder="eleanor@example.com"
              className="flex-1 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition active:scale-98"
            >
              Subscribe
            </button>
          </form>

          {newsletterSubmitted && (
            <p className="mt-3 text-xs font-semibold text-emerald-400 animate-fade-in">
              ✓ Thank you for subscribing. Welcome to the collective.
            </p>
          )}
        </div>
      </section>

      {/* --- LUXURY FOOTER --- */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800/80 text-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 font-serif-editorial text-sm font-bold text-white">
                S
              </span>
              <span className="font-serif-editorial text-base font-bold text-white">
                ShopKart
              </span>
            </div>
            <p className="text-slate-500 leading-relaxed text-[11px]">
              Thoughtfully engineered e-commerce architecture. Powered by MongoDB, Express 5, React 19, and Razorpay.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">Disciplines</h4>
            <ul className="space-y-2 text-[11px]">
              <li><Link to="/products?category=Electronics" className="hover:text-white transition">Studio Gear</Link></li>
              <li><Link to="/products?category=Fashion" className="hover:text-white transition">Apparel & Footwear</Link></li>
              <li><Link to="/products?category=Home%20%26%20Living" className="hover:text-white transition">Living & Ceramics</Link></li>
              <li><Link to="/products?category=Books" className="hover:text-white transition">Architecture Volumes</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">Customer Care</h4>
            <ul className="space-y-2 text-[11px]">
              <li><Link to="/orders" className="hover:text-white transition">Order Tracking</Link></li>
              <li><Link to="/cart" className="hover:text-white transition">Shopping Bag</Link></li>
              <li><Link to="/wishlist" className="hover:text-white transition">Saved Pieces</Link></li>
              <li><Link to="/profile" className="hover:text-white transition">Account Session</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">Security & Compliance</h4>
            <ul className="space-y-2 text-[11px] text-slate-500">
              <li>HMAC SHA256 Signature Verification</li>
              <li>HTTP-only Strict Cookie Tokens</li>
              <li>PCI-DSS Razorpay Gateway</li>
              <li>ISO/IEC 27001 Data Integrity</li>
            </ul>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} ShopKart Atelier. All rights reserved.</p>
          <p>Designed with architectural precision for elevated living.</p>
        </div>
      </footer>
    </div>
  );
}
