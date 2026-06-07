/**
 * HomePageSkeleton
 * Shown via React Suspense while the Home page chunk is loading.
 * The Header/Footer/Nav are already rendered by MainLayout, so this
 * only needs to replicate the *content* area of Home:
 *   - Sidebar + Hero slider row
 *   - Two product-section rows (title + cards)
 */
export default function HomePageSkeleton() {
  return (
    <div className="animate-pulse">
      {/* ── Hero area: Sidebar + Slider ────────────────────────────── */}
      <section className="container-main py-4">
        <div className="flex gap-4 items-stretch h-[220px] sm:h-[300px] lg:h-[420px]">

          {/* Category sidebar — desktop only */}
          <aside className="hidden lg:flex flex-col w-56 shrink-0 bg-gray-100 dark:bg-gray-800 rounded-lg p-3 gap-2">
            <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            ))}
          </aside>

          {/* Hero slider placeholder */}
          <div className="flex-1 min-w-0 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>
      </section>

      {/* ── Feature bar strip ───────────────────────────────────────── */}
      <div className="bg-gray-100 dark:bg-gray-800 py-4 mt-2">
        <div className="container-main flex gap-6 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 flex-1">
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
              <div className="flex flex-col gap-1.5 flex-1">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Product section rows ────────────────────────────────────── */}
      {Array.from({ length: 2 }).map((_, s) => (
        <section key={s} className="container-main py-6">
          {/* Section title */}
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
          {/* Product cards grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700">
                {/* Image placeholder */}
                <div className="aspect-square bg-gray-200 dark:bg-gray-700" />
                {/* Text placeholders */}
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-1" />
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
