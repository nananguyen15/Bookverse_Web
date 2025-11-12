export function Someseries() {
  return (
      <div className="grid grid-cols-12 px-16 py-6">
        {/* Title and See All */}
        <div className="flex items-center justify-between col-span-12 my-5">
          <h2 className="text-3xl font-bold font-heading text-beige-900">
            Series
          </h2>
          <a
            href="/seriess"
            className="text-base font-medium transition-colors text-beige-700 hover:text-beige-900 hover:underline"
          >
            See All →
          </a>
        </div>

        {/* Books Grid */}
        <div className="flex flex-row items-start justify-between col-span-12 gap-8 pb-4 overflow-x-auto">
          {topBooks.map((book) => (
            <BookCard key={book.id} book={book} onAddToCart={handleAddToCart} />
          ))}
        </div>
      </div>
  );
}
