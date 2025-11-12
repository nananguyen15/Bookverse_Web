import { ShoppingCart } from "lucide-react";

// Mock Book type and data
type Book = {
  id: string;
  title: string;
  author: string;
  price: number;
  image: string;
  salesCount: number;
};

const topBooks: Book[] = [
  {
    id: "1",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    price: 15.99,
    image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400",
    salesCount: 1250,
  },
  {
    id: "2",
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    price: 12.99,
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
    salesCount: 1180,
  },
  {
    id: "3",
    title: "1984",
    author: "George Orwell",
    price: 14.99,
    image: "https://images.unsplash.com/photo-1495640452828-3df6795cf69b?w=400",
    salesCount: 1050,
  },
  {
    id: "4",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    price: 13.99,
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400",
    salesCount: 980,
  },
  {
    id: "5",
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    price: 11.99,
    image: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=400",
    salesCount: 920,
  },
  {
    id: "6",
    title: "Animal Farm",
    author: "George Orwell",
    price: 10.99,
    image: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=400",
    salesCount: 850,
  },
].sort((a, b) => b.salesCount - a.salesCount);

export function Somebooks() {
  return (
    <div className="px-16 py-6">
      {/* Header with "Books" title and "See All" link */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold font-heading text-beige-900">
          Books
        </h2>
        <a
          href="/browse"
          className="px-4 py-2 text-sm font-medium transition-colors bg-transparent border-2 border-beige-700 text-beige-700 hover:bg-beige-700 hover:text-beige-50"
        >
          See All
        </a>
      </div>

      {/* Books grid */}
      <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-6">
        {topBooks.map((book) => (
          <a
            key={book.id}
            href={`/item/${book.id}`}
            className="flex flex-col overflow-hidden transition-transform duration-300 bg-white rounded-lg shadow-sm group hover:shadow-md hover:-translate-y-1"
          >
            {/* Book cover image */}
            <div className="relative w-full overflow-hidden aspect-[3/4] bg-gray-200">
              <img
                src={book.image}
                alt={book.title}
                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            </div>

            {/* Book info */}
            <div className="flex flex-col flex-1 p-3">
              <h3 className="mb-1 text-sm font-bold line-clamp-2 text-beige-900">
                {book.title}
              </h3>
              <p className="mb-2 text-xs text-beige-600 line-clamp-1">
                {book.author}
              </p>

              {/* Price and cart icon */}
              <div className="flex items-center justify-between mt-auto">
                <span className="text-base font-bold text-beige-800">
                  ${book.price.toFixed(2)}
                </span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    // Add to cart logic here
                    console.log("Add to cart:", book.id);
                  }}
                  className="p-1.5 transition-colors rounded-full hover:bg-beige-100"
                  aria-label="Add to cart"
                >
                  <ShoppingCart className="w-4 h-4 text-beige-700" />
                </button>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
