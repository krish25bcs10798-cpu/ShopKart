import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function Profile() {
  const { user: activeCustomerEntity, logout: terminateSession } = useAuth();

  if (!activeCustomerEntity) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-1 mx-auto max-w-md w-full px-4 py-20 text-center">
          <p className="text-sm text-slate-500">Customer profile not found.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="flex-1 mx-auto max-w-3xl w-full px-4 py-10 sm:px-6">
        <nav className="mb-6 flex items-center gap-2 text-xs text-slate-500">
          <Link to="/" className="hover:text-slate-900 transition">Home</Link>
          <span>/</span>
          <span className="font-semibold text-slate-900">Member Account Profile</span>
        </nav>

        <div className="rounded-3xl lux-glass-panel p-6 sm:p-10 shadow-lg">
          {/* Identity Header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-8 border-b border-slate-200">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-indigo-600 font-serif-editorial text-3xl font-bold text-white shadow-md shadow-indigo-600/25">
              {activeCustomerEntity.name ? activeCustomerEntity.name.charAt(0).toUpperCase() : "U"}
            </div>

            <div className="text-center sm:text-left space-y-1 flex-1">
              <span className="inline-block rounded-full bg-slate-900 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white mb-1 shadow-2xs">
                Verified Customer
              </span>
              <h1 className="font-serif-editorial text-2xl sm:text-3xl font-bold text-slate-900">
                {activeCustomerEntity.name}
              </h1>
              <p className="text-xs text-slate-500">{activeCustomerEntity.email}</p>
              <p className="text-xs text-slate-500">{activeCustomerEntity.phoneNo}</p>
            </div>
          </div>

          {/* Session & Security Architecture Specs */}
          <div className="py-6 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Session & Security Architecture
            </h2>
            <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 text-xs text-slate-600 space-y-2">
              <p>
                <strong className="text-slate-900">Authentication Protocol:</strong> Session state is authenticated via HTTP-only JWT cookies with Lax same-site protection and SHA-256 validation.
              </p>
              <p>
                <strong className="text-slate-900">Cryptographic Isolation:</strong> Cart items, wishlist records, and payment sessions are strictly scoped to your tenant MongoDB ObjectId.
              </p>
            </div>
          </div>

          {/* Action Links */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-200">
            <Link
              to="/products"
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition"
            >
              Browse Catalog
            </Link>
            <Link
              to="/orders"
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition"
            >
              Order History
            </Link>
            <Link
              to="/wishlist"
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition"
            >
              Saved Pieces
            </Link>
            <Link
              to="/cart"
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition"
            >
              Shopping Bag
            </Link>
            <button
              type="button"
              onClick={terminateSession}
              className="ml-auto rounded-xl bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-100 transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
