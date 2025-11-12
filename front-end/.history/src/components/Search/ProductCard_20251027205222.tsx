import { BsCart2, BsStar, BsStarFill } from "react-icons/bs";
import { Link } from "react-router-dom";

type ProductCardProps = {
  id: string | number;
  title: string;
  author?: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating?: number;
  reviewCount?: number;
  discount?: number;
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
  rating = 0,
  reviewCount = 0,
  discount,
  type,
  onAddToCart,
}: ProductCardProps) {
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart?.(id);
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= rating ? (
          <BsStarFill key={i} className="w-3 h-3 text-yellow-400" />
        ) : (
          <BsStar key={i} className="w-3 h-3 text-gray-300" />
        )
      );
    }
    return stars;
  };

  // Convert title to URL-friendly slug
  const titleSlug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
  const productLink = `/${type}/${id}/${titleSlug}`;

  return (
    <div className="flex flex-col h-full overflow-hidden transition-shadow duration-300 bg-white border rounded-lg shadow-sm border-beige-200 hover:shadow-lg">
      <Link to={productLink}>
        <img src={image} alt={title} className="object-cover w-full h-64" />
        {discount && (
          <div className="absolute px-2 py-1 text-xs font-bold text-white bg-red-500 rounded top-2 left-2">
            -{discount}%
          </div>
        )}
      </Link>
      <div className="flex flex-col flex-grow p-4">
        <Link to={productLink}>
          <h3 className="mb-2 text-lg font-semibold line-clamp-2 text-beige-900 hover:text-beige-700">
            {title}
          </h3>
        </Link>

        {author && (
          <p className="mb-2 text-xs text-gray-600 line-clamp-1">
            by: {author}
          </p>
        )}

        {/* Rating */}
        {reviewCount > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex gap-0.5">{renderStars()}</div>
            <span className="text-xs text-gray-500">({reviewCount})</span>
          </div>
        )}

        {/* Price Section */}
        <div className="flex items-center justify-between mt-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-red-600">
                ${price.toFixed(2)}
              </span>
              {originalPrice && originalPrice > price && (
                <span className="text-sm text-gray-400 line-through">
                  ${originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            className="p-2 text-white transition-colors rounded-lg bg-beige-700 hover:bg-beige-800"
            aria-label="Add to cart"
          >
            <BsCart2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
