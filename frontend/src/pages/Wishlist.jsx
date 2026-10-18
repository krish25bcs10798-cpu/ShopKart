import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import WishlistCard from "../components/WishlistCard";
import { getWishlist, removeFromWishlist } from "../services/api";

export default function Wishlist() {
  const [activeWishlistCollection, setActiveWishlistCollection] = useState([]);
  const [isWishlistFetching, setIsWishlistFetching] = useState(true);
  const [wishlistFaultNotice, setWishlistFaultNotice] = useState(null);
  const [cacheBusterIndex, setCacheBusterIndex] = useState(0);

  useEffect(() => {
    let activeComponent = true;

    const queryCustomerWishlist = async () => {
      try {
        const wishlistOutcome = await getWishlist();
        if (activeComponent) {
          if (wishlistOutcome?.success && Array.isArray(wishlistOutcome.wishlist)) {
            setActiveWishlistCollection(wishlistOutcome.wishlist);
          } else {
            setActiveWishlistCollection([]);
          }
        }
      } catch (queryError) {
        if (activeComponent) {
          console.error("Wishlist query failure:", queryError);
          setWishlistFaultNotice("Something went wrong while retrieving your saved pieces.");
        }
      } finally {
        if (activeComponent) {
          setIsWishlistFetching(false);
        }
      }
    };

    queryCustomerWishlist();

    return () => {
      activeComponent = false;
    };
  }, [cacheBusterIndex]);

  const handleEjectWishlistItem = async (productIdentifier) => {
    try {
      await removeFromWishlist(productIdentifier);
      setActiveWishlistCollection((previousItems) =>
        previousItems.filter((item) => item._id !== productIdentifier)
      );
      window.dispatchEvent(new Event("wishlist-updated"));
    } catch (ejectionError) {
      console.error("Failed to remove item from wishlist:", ejectionError);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-slate-500">
          <Link to="/" className="hover:text-slate-900 transition">Home</Link>
          <span>/</span>
          <span className="font-semibold text-slate-900">Saved Wishlist</span>
        </nav>

        {/* Section Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-600">
              Personal Curation
            </span>
            <h1 className="mt-1 font-serif-editorial text-3xl sm:text-5xl font-bold tracking-tight text-slate-900">
              Saved Wishlist
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-500">
              Curated articles and design pieces you have reserved for future moments.
            </p>
          </div>

          {!isWishlistFetching && !wishlistFaultNotice && (
            <div className="rounded-full lux-badge px-4 py-1.5 text-xs font-semibold text-slate-800 self-start sm:self-auto shadow-xs">
              <span>{activeWishlistCollection.length} {activeWishlistCollection.length === 1 ? "Saved Piece" : "Saved Pieces"}</span>
            </div>
          )}
        </div>

        {/* Loading Skeletons */}
        {isWishlistFetching ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4].map((skeletonIdx) => (
              <div key={skeletonIdx} className="aspect-4/3 rounded-2xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : wishlistFaultNotice ? (
          <div className="mx-auto max-w-md rounded-2xl lux-glass-panel p-8 text-center my-12 border border-rose-200">
            <h3 className="font-serif-editorial text-lg font-bold text-slate-900">
              Unable to load saved pieces
            </h3>
            <p className="mt-2 text-xs text-slate-500">
              {wishlistFaultNotice}
            </p>
            <button
              type="button"
              onClick={() => setCacheBusterIndex((i) => i + 1)}
              className="mt-5 inline-flex items-center rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700"
            >
              Retry
            </button>
          </div>
        ) : activeWishlistCollection.length === 0 ? (
          <div className="mx-auto max-w-md rounded-3xl lux-glass-panel p-10 text-center my-12 shadow-md">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </div>
            <h2 className="font-serif-editorial text-2xl font-bold text-slate-900">
              Your wishlist is currently empty
            </h2>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              Browse our catalog of 50+ curated products and tap the heart icon to save items for later.
            </p>
            <Link
              to="/products"
              className="mt-6 inline-flex items-center rounded-xl bg-indigo-600 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition"
            >
              Browse Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {activeWishlistCollection.map((productRecord) => (
              <WishlistCard
                key={productRecord._id}
                product={productRecord}
                onRemove={handleEjectWishlistItem}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
