export default function SearchBar({
  search: currentSearchQuery,
  setSearch: updateSearchQuery,
  category: activeCategoryFilter,
  setCategory: updateCategoryFilter,
  sort: activeSortOrder,
  setSort: updateSortOrder,
  onReset: handleFilterReset,
}) {
  const categoryTaxonomy = [
    { label: "All Categories", icon: "✦" },
    { label: "Electronics", icon: "⚡" },
    { label: "Fashion", icon: "🧥" },
    { label: "Home & Living", icon: "🏺" },
    { label: "Books", icon: "📚" },
    { label: "Wellness", icon: "🌿" },
    { label: "Workspace", icon: "🖋️" },
  ];

  const sortStrategies = [
    { value: "", label: "Featured Curation" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
  ];

  const hasActiveFiltersApplied =
    Boolean(currentSearchQuery) ||
    (Boolean(activeCategoryFilter) && activeCategoryFilter !== "All Categories") ||
    Boolean(activeSortOrder);

  return (
    <div className="space-y-4">
      {/* Search Input & Sort Selector Deck */}
      <div className="rounded-2xl lux-glass-panel p-3.5 sm:p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input Field */}
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </div>
            <input
              type="text"
              value={currentSearchQuery}
              onChange={(e) => updateSearchQuery(e.target.value)}
              placeholder="Search across 50+ curated studio artifacts..."
              className="w-full rounded-xl border border-slate-200 bg-white/90 py-2.5 pl-10 pr-9 text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10"
            />
            {currentSearchQuery && (
              <button
                type="button"
                onClick={() => updateSearchQuery("")}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-700 transition"
                title="Clear search query"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Sort Dropdown Selector */}
          <div className="relative min-w-[190px]">
            <select
              value={activeSortOrder}
              onChange={(e) => updateSortOrder(e.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white/90 py-2.5 pl-3.5 pr-8 text-xs sm:text-sm font-semibold text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 cursor-pointer shadow-xs"
            >
              {sortStrategies.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>

          {/* Reset Filters Action Button */}
          {hasActiveFiltersApplied && (
            <button
              type="button"
              onClick={handleFilterReset}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 shadow-2xs active:scale-98"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Rail */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
        {categoryTaxonomy.map((categoryItem) => {
          const isCategorySelected =
            activeCategoryFilter === categoryItem.label ||
            (!activeCategoryFilter && categoryItem.label === "All Categories");

          return (
            <button
              key={categoryItem.label}
              type="button"
              onClick={() => {
                if (categoryItem.label === "All Categories") {
                  updateCategoryFilter("");
                } else {
                  updateCategoryFilter(categoryItem.label);
                }
              }}
              className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-200 active:scale-98 ${
                isCategorySelected
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/25"
                  : "border border-slate-200 bg-white/80 text-slate-600 hover:border-slate-300 hover:bg-white hover:text-slate-900 shadow-2xs"
              }`}
            >
              <span>{categoryItem.icon}</span>
              <span>{categoryItem.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
