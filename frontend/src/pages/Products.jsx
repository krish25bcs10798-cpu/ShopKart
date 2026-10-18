import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";
import { getProducts } from "../services/api";

export default function Products() {
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();
  const initialCategoryQuery = urlSearchParams.get("category") || "";

  const [activeCatalogProducts, setActiveCatalogProducts] = useState([]);
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);
  const [catalogFetchError, setCatalogFetchError] = useState(null);

  // Search, filter, and sorting states
  const [rawSearchKeyword, setRawSearchKeyword] = useState("");
  const [deferredSearchKeyword, setDeferredSearchKeyword] = useState("");
  const [activeCategoryTaxon, setActiveCategoryTaxon] = useState(initialCategoryQuery);
  const [activeSortStrategy, setActiveSortStrategy] = useState("");
  const [refreshTriggerKey, setRefreshTriggerKey] = useState(0);

  // Sync category state when URL query param changes
  useEffect(() => {
    const categoryFromUrl = urlSearchParams.get("category") || "";
    setActiveCategoryTaxon(categoryFromUrl);
  }, [urlSearchParams]);

  // Debounce search keyword input to avoid rapid network calls
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setDeferredSearchKeyword(rawSearchKeyword);
    }, 250);
    return () => clearTimeout(debounceTimer);
  }, [rawSearchKeyword]);

  // Query catalog from Express backend
  useEffect(() => {
    let activeComponent = true;
    setIsCatalogLoading(true);
    setCatalogFetchError(null);

    const queryStoreCatalog = async () => {
      try {
        const queryOutcome = await getProducts({
          search: deferredSearchKeyword,
          category: activeCategoryTaxon,
          sort: activeSortStrategy,
        });

        if (activeComponent) {
          if (queryOutcome?.success && Array.isArray(queryOutcome.products)) {
            setActiveCatalogProducts(queryOutcome.products);
          } else if (Array.isArray(queryOutcome)) {
            setActiveCatalogProducts(queryOutcome);
          } else {
            setActiveCatalogProducts([]);
          }
        }
      } catch (networkError) {
        if (activeComponent) {
          console.error("Failed to query catalog products:", networkError);
          setCatalogFetchError("We encountered an issue loading products. Please try again.");
        }
      } finally {
        if (activeComponent) {
          setIsCatalogLoading(false);
        }
      }
    };

    queryStoreCatalog();

    return () => {
      activeComponent = false;
    };
  }, [deferredSearchKeyword, activeCategoryTaxon, activeSortStrategy, refreshTriggerKey]);

  const handleCategorySelectionChange = (newCategorySelection) => {
    setActiveCategoryTaxon(newCategorySelection);
    if (newCategorySelection) {
      setUrlSearchParams({ category: newCategorySelection });
    } else {
      setUrlSearchParams({});
    }
  };

  const handleFilterPurge = () => {
    setRawSearchKeyword("");
    setDeferredSearchKeyword("");
    setActiveCategoryTaxon("");
    setActiveSortStrategy("");
    setUrlSearchParams({});
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-slate-500">
          <Link to="/" className="hover:text-slate-900 transition">Home</Link>
          <span>/</span>
          <span className="font-semibold text-slate-900">Store Catalog</span>
          {activeCategoryTaxon && (
            <>
              <span>/</span>
              <span className="text-indigo-600 font-semibold">{activeCategoryTaxon}</span>
            </>
          )}
        </nav>

        {/* Section Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-600">
              Curated Inventory
            </span>
            <h1 className="mt-1 font-serif-editorial text-3xl sm:text-5xl font-bold tracking-tight text-slate-900">
              {activeCategoryTaxon ? `${activeCategoryTaxon} Collection` : "Full Catalog"}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-500">
              Explore 50+ thoughtfully engineered artifacts across acoustic gear, apparel, living, and workspace.
            </p>
          </div>

          {!isCatalogLoading && !catalogFetchError && (
            <div className="rounded-full lux-badge px-4 py-1.5 text-xs font-semibold text-slate-800 self-start sm:self-auto shadow-xs">
              <span>{activeCatalogProducts.length} {activeCatalogProducts.length === 1 ? "Product" : "Products"}</span>
            </div>
          )}
        </div>

        {/* Search & Filter Deck */}
        <div className="mb-8">
          <SearchBar
            search={rawSearchKeyword}
            setSearch={setRawSearchKeyword}
            category={activeCategoryTaxon}
            setCategory={handleCategorySelectionChange}
            sort={activeSortStrategy}
            setSort={setActiveSortStrategy}
            onReset={handleFilterPurge}
          />
        </div>

        {/* Products Grid / States */}
        {isCatalogLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((skeletonIdx) => (
              <div key={skeletonIdx} className="aspect-4/3 rounded-2xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : catalogFetchError ? (
          <div className="mx-auto max-w-md rounded-2xl lux-glass-panel p-8 text-center my-12 border border-rose-200">
            <h3 className="font-serif-editorial text-lg font-bold text-slate-900">
              Catalog unavailable
            </h3>
            <p className="mt-2 text-xs text-slate-500">
              {catalogFetchError}
            </p>
            <button
              type="button"
              onClick={() => setRefreshTriggerKey((k) => k + 1)}
              className="mt-5 inline-flex items-center rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700"
            >
              Retry Loading
            </button>
          </div>
        ) : activeCatalogProducts.length === 0 ? (
          <div className="mx-auto max-w-md rounded-3xl lux-glass-panel p-10 text-center my-12">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <h2 className="font-serif-editorial text-2xl font-bold text-slate-900">
              No matching artifacts found
            </h2>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              We couldn’t locate any pieces matching your specified search criteria. Try modifying your keywords or resetting filters.
            </p>
            <button
              type="button"
              onClick={handleFilterPurge}
              className="mt-6 inline-flex items-center rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700 active:scale-98"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {activeCatalogProducts.map((productEntity) => (
              <ProductCard key={productEntity._id} product={productEntity} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
