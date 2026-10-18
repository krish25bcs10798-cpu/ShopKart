import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import Navbar from "../components/Navbar";

export default function Home() {
  const { user: activeCustomerAccount } = useAuth();
  const { cartCount: totalBagUnits } = useCart();

  const curatedCategoryTaxonomy = [
    { name: "Electronics", desc: "Studio acoustics, mechanical decks & optics", icon: "⚡" },
    { name: "Fashion", desc: "Heavyweight boxy cottons & selvedge denim", icon: "🧥" },
    { name: "Home & Living", desc: "Ceramics, flax linen & architectural lights", icon: "🏺" },
    { name: "Workspace", desc: "Brass tools, felt desk mats & walnut risers", icon: "🖋️" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-10 sm:px-6 lg:px-8">
        {/* Welcome Dashboard Hero Card */}
        <div className="rounded-3xl lux-glass-panel p-8 sm:p-12 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-bold text-indigo-700">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse" />
              Authenticated Atelier Session
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Session Bound: {activeCustomerAccount?.email}
            </span>
          </div>

          <h1 className="mt-4 font-serif-editorial text-3xl sm:text-5xl font-bold text-slate-900 tracking-tight">
            Welcome back, {activeCustomerAccount?.name || "Member"}.
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
            Your personal collection space is active. Explore our newly curated 50+ item catalog,
            manage your reserved pieces, or proceed to checkout with your active shopping bag.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-xs uppercase tracking-wider font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition active:scale-98"
            >
              Explore 50+ Products
            </Link>

            <Link
              to="/cart"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-xs uppercase tracking-wider font-bold text-slate-800 hover:bg-slate-50 transition shadow-2xs"
            >
              Shopping Bag ({totalBagUnits})
            </Link>

            <Link
              to="/wishlist"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-xs uppercase tracking-wider font-bold text-slate-800 hover:bg-slate-50 transition shadow-2xs"
            >
              Saved Wishlist
            </Link>

            <Link
              to="/orders"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-xs uppercase tracking-wider font-bold text-slate-800 hover:bg-slate-50 transition shadow-2xs"
            >
              Past Orders
            </Link>
          </div>
        </div>

        {/* Quick Discovery Realms */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif-editorial text-xl font-bold text-slate-900">
              Curated Disciplines
            </h3>
            <Link to="/products" className="text-xs font-bold text-indigo-600 hover:underline">
              View All Categories →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {curatedCategoryTaxonomy.map((categoryItem) => (
              <Link
                key={categoryItem.name}
                to={`/products?category=${encodeURIComponent(categoryItem.name)}`}
                className="rounded-2xl lux-card p-5 group transition"
              >
                <div className="text-3xl mb-3">{categoryItem.icon}</div>
                <h4 className="font-serif-editorial text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {categoryItem.name}
                </h4>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  {categoryItem.desc}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
