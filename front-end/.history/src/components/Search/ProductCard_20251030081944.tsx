import { BsCart2 } from "react-icons/bs";
import { Link } from "react-router-dom";
import { getReviewCount } from "../../utils/reviewHelpers";

type ProductCardProps = {
  id: string | number;
  title: string;
  author?: string;
  price: number;
  originalPrice?: number;
  image: string;
  type: "book" | "series";
  onAddToCart?: (id: string | number) => void;
};

export function ProductCard({
  id,
  title,
  author,
  price,
  originalPrice,
  image,
  type,
  onAddToCart,
}: ProductCardProps) {
  const titleSlug = title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
  const productLink = `/${type}/${id}/${titleSlug}`;

  const reviewCount = getReviewCount(type, id.toString());
  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <div className="flex flex-col h-full overflow-hidden transition-shadow duration-300 bg-white border rounded-lg shadow-sm border-beige-200 hover:shadow-lg">
      <Link to={productLink} className="relative flex-shrink-0">
        <img src={image} alt={title} className="object-cover w-full h-64" />
        {discount > 0 && (
          <span className="absolute px-2 py-1 text-xs font-bold text-white rounded-lg top-2 right-2 bg-beige-700">
            -{discount}%
          </span>
        )}
      </Link>
      <div className="flex flex-col flex-grow p-4">
        <Link to={productLink}>
          <h3 className="mb-2 text-lg font-semibold line-clamp-2 text-beige-900 hover:text-beige-700 font-heading">
            {title}
          </h3>
        </Link>
        <p className="mb-2 text-sm text-beige-600">{author}</p>

        <div className="flex items-center gap-2 mb-3">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.round(rating)
                    ? "text-yellow-500"
                    : "text-gray-300"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-xs text-beige-600">({reviewCount})</span>
        </div>

        <div className="flex items-center gap-2 mt-auto mb-3">
          <span className="text-xl font-bold text-beige-900">
            ${price.toFixed(2)}
          </span>
          {originalPrice && (
            <span className="text-sm text-gray-500 line-through">
              ${originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        <button
          onClick={() => onAddToCart(id)}
          className="flex items-center justify-center w-full py-3 text-white transition-colors rounded-lg bg-beige-700 hover:bg-beige-800"
          title="Add to Cart"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  );
}
