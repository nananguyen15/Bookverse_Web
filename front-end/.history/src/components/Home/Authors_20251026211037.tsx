export function Categories() {
  return (
    <div className="px-16 py-6">
      {/* Title and See All */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold font-heading text-beige-900">
          Categories
        </h2>
        <a
          href="/series"
          className="text-base font-medium transition-colors text-beige-700 hover:text-beige-900 hover:underline"
        >
          See All →
        </a>
      </div>
    </div>
  );
}
