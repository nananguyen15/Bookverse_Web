import { Link } from "react-router-dom";

type ProductCardProps = {
  id: string | number;
  title: string;
  author: string;
  price: number;
  image: string;
  type: "book" | "series";
  onAddToCart: (id: string | number) => void;
};

export function ProductCard({
  id,
  title,
  author,
  price,
  image,
  type,
  onAddToCart,
}: ProductCardProps) {
  const titleSlug = title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
  const productLink = `/${type}/${id}/${titleSlug}`;

  return (
    <div className="flex flex-col overflow-hidden transition-all duration-300 bg-white rounded-lg shadow-sm hover:shadow-xl group">
      {/* Image Container */}
      <Link to={productLink} className="relative overflow-hidden bg-beige-100">
        <img
          src={image}
          alt={title}
          className="object-cover w-full transition-transform duration-300 h-80 group-hover:scale-105"
        />
      </Link>

      {/* Content Container */}
      <div className="relative flex flex-col flex-grow p-4">
        <Link to={productLink}>
          <h3 className="mb-2 text-lg font-bold leading-tight line-clamp-2 text-beige-900 hover:text-beige-700 font-heading">
            {title}
          </h3>
        </Link>
        <p className="mb-4 text-sm text-beige-600">by: {author}</p>

        {/* Price and Cart Container */}
        <div className="flex items-center justify-between mt-auto">
          <span className="text-2xl font-bold text-beige-900">
            ${price.toFixed(2)}
          </span>

          {/* Add to Cart Button */}
          <button
            onClick={() => onAddToCart(id)}
            className="flex items-center justify-center w-12 h-12 text-white transition-all duration-300 rounded-full bg-beige-700 hover:bg-beige-800 hover:scale-110"
            title="Add to Cart"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
