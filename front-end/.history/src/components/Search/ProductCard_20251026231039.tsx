import { BsCart2, BsStar, BsStarFill } from "react-icons/bs";

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

  return (
    <a
      href={`/${type}/${id}`}
      className="block overflow-hidden transition-shadow bg-white border border-gray-200 rounded-lg group hover:shadow-lg"
    >
      {/* Image Container */}
      <div className="relative h-64 overflow-hidden bg-gray-100">
        <img
          src={image}
          alt={title}
          className="object-contain w-full h-full"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder-book.jpg";
          }}
        />
        {discount && (
          <div className="absolute px-2 py-1 text-xs font-bold text-white bg-red-500 rounded top-2 left-2">
            -{discount}%
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="mb-1 text-sm font-semibold text-gray-900 line-clamp-2">
          {title}
        </h3>

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
    </a>
  );
}
