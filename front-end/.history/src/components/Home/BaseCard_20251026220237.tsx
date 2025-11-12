import { BsCart2 } from "react-icons/bs";

type BaseCardProps = {
  id: string | number;
  title: string;
  author?: string | null;
  price: number;
  image: string;
  layout?: "vertical" | "horizontal";
  onAddToCart?: (id: string | number) => void;
  detailUrl?: string;
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
}: BaseCardProps) {
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart?.(id);
  };

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
            <p className="text-xl font-semibold text-white">
              ${price.toFixed(2)}
            </p>
            <button
              onClick={handleAddToCart}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors border border-white rounded hover:bg-white hover:text-gray-900"
              aria-label="Add to cart"
            >
              <span>Add</span>
              <BsCart2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </a>
    );
  }

  // Vertical layout (original BookCard style)
  return (
    <a
      href={detailUrl || `#`}
      className="block w-48 transition-shadow shrink-0 group sm:w-56 md:w-64 hover:shadow-lg"
    >
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
        <h3 className="text-base font-bold text-beige-900 line-clamp-2 font-heading">
          {title}
        </h3>
        {author && (
          <p className="text-sm text-beige-600 line-clamp-1">by: {author}</p>
        )}

        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold text-beige-800">
            ${price.toFixed(2)}
          </p>
          <button
            onClick={handleAddToCart}
            className="p-2 text-white transition-colors rounded-full bg-beige-700 hover:bg-beige-800"
            aria-label="Add to cart"
          >
            <BsCart2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </a>
  );
}
