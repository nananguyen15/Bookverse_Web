import { BsCart2 } from "react-icons/bs";
import { useAuth } from "../../contexts/AuthContext";

type BaseCardProps = {
  id: string | number;
  title: string;
  author?: string | null;
  price: number;
  image: string;
  layout?: "vertical" | "horizontal";
  onAddToCart?: (id: string | number) => void;
  detailUrl?: string;
  active?: boolean;
  stockQuantity?: number;
  promoPrice?: number | null;
  promoPercentage?: number | null;
};

export function BaseCard({
  id,
  title,
  author,
  price,
  image,
  layout = "vertical",
  onAddToCart,
  detailUrl,
  active = true,
  stockQuantity = 1,
  promoPrice,
  promoPercentage,
}: BaseCardProps) {
  const { user } = useAuth();
  const userRole = user?.role?.toLowerCase();
  const isAdminOrStaff = userRole === "admin" || userRole === "staff";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Don't allow add to cart if inactive or out of stock
    if (!active || stockQuantity <= 0) {
      alert(
        !active
          ? "This product is currently unavailable."
          : "This product is out of stock."
      );
      return;
    }

    onAddToCart?.(id);
  };

  const isUnavailable = !active || stockQuantity <= 0;

  if (layout === "horizontal") {
    return (
      <a
        href={detailUrl || `#`}
        className="flex h-64 overflow-hidden transition-transform bg-white rounded-lg shadow-sm group hover:shadow-md hover:scale-102"
      >
        {/* Image - Left side */}
        <div className="relative w-1/2 bg-gray-200">
          <img
            src={image}
            alt={title}
            className="object-cover w-full h-full"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder-book.jpg";
            }}
          />
        </div>

        {/* Content - Right side */}
        <div className="flex flex-col justify-between w-1/2 p-4 bg-gradient-to-br from-gray-900 to-gray-800">
          <div>
            <h3 className="mb-2 text-lg font-bold text-white line-clamp-2 font-heading">
              {title}
            </h3>
            {author && (
              <p className="mb-2 text-sm text-gray-300 line-clamp-1">
                by: {author}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between mt-auto">
            <div className="flex flex-col">
              {promoPrice !== null && promoPrice !== undefined ? (
                <>
                  <p className="text-sm text-gray-400 line-through">
                    ${price.toFixed(2)}
                  </p>
                  <p className="text-xl font-semibold text-green-400">
                    ${promoPrice.toFixed(2)}
                    {promoPercentage && (
                      <span className="ml-2 text-xs text-green-300">
                        -{promoPercentage}%
                      </span>
                    )}
                  </p>
                </>
              ) : (
                <p className="text-xl font-semibold text-white">
                  ${price.toFixed(2)}
                </p>
              )}
            </div>
            {!isAdminOrStaff && (
              <button
                onClick={handleAddToCart}
                className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-colors border rounded ${isUnavailable
                    ? "bg-gray-500 border-gray-500 text-gray-300 cursor-not-allowed"
                    : "text-white border-white hover:bg-white hover:text-gray-900"
                  }`}
                aria-label="Add to cart"
                disabled={isUnavailable}
              >
                <span>{isUnavailable ? "Unavailable" : "Add"}</span>
                <BsCart2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </a>
    );
  }

  // Vertical layout (original BookCard style)
  return (
    <a
      href={detailUrl || `#`}
      className="block w-48 px-2 pb-2 transition-shadow rounded-lg shrink-0 group sm:w-56 md:w-64 hover:shadow-md"
    >
      {/* Image - Giữ nguyên */}
      <div className="relative w-full h-64 mb-3 overflow-hidden bg-gray-200 rounded-lg sm:h-72 md:h-80">
        <img
          src={image}
          alt={title}
          className="object-contain w-full h-full"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder-book.jpg";
          }}
        />
      </div>

      <div className="space-y-1">
        {/* Title - Fixed height để đồng đều */}
        <h3
          className="text-base font-bold text-beige-900 line-clamp-2 font-heading"
          style={{ minHeight: '3rem' }} // Fixed ~2 lines of text
        >
          {title}
        </h3>

        {/* Author - Fixed height */}
        <div style={{ minHeight: '1.25rem' }}>
          {author && (
            <p className="text-sm text-beige-600 line-clamp-1">by: {author}</p>
          )}
        </div>

        {/* Price + Button */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            {promoPrice !== null && promoPrice !== undefined ? (
              <>
                <p className="text-sm text-gray-500 line-through">
                  ${price.toFixed(2)}
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-lg font-semibold text-green-600">
                    ${promoPrice.toFixed(2)}
                  </p>
                  {promoPercentage && (
                    <span className="px-1.5 py-0.5 text-xs font-medium text-white bg-red-500 rounded">
                      -{promoPercentage}%
                    </span>
                  )}
                </div>
              </>
            ) : (
              <p className="text-lg font-semibold text-beige-800">
                ${price.toFixed(2)}
              </p>
            )}
          </div>
          {!isAdminOrStaff && (
            <button
              onClick={handleAddToCart}
              className={`p-2 transition-colors rounded-full ${isUnavailable
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-beige-700 hover:bg-beige-800 text-white"
                }`}
              aria-label="Add to cart"
              disabled={isUnavailable}
              title={isUnavailable ? (!active ? "Unavailable" : "Out of stock") : "Add to cart"}
            >
              <BsCart2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </a>
  );
}
