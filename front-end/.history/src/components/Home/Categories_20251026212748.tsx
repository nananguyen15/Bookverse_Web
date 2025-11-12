export function Categories() {
  return (
          <div className="flex items-center justify-between col-span-12 my-5">
        <h2 className="text-3xl font-bold font-heading text-beige-900">
          Books
        </h2>
        <a
          href="/books"
          className="text-base font-medium transition-colors text-beige-700 hover:text-beige-900 hover:underline"
        >
          See All →
        </a>
      </div>

  )
}