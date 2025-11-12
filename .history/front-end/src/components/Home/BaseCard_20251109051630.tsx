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
      className="flex flex-col w-48 px-2 overflow-hidden transition-shadow rounded-lg shadow-sm shrink-0 group sm:w-56 hover:shadow-md"
      style={{ height: '420px' }} // Fixed height
    >
      {/* Part 1: Image - Fixed height */}
      <div className="relative w-full h-64 overflow-hidden bg-gray-200 shrink-0">
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

      {/* Part 2 & 3: Content - Flex grow to fill remaining space */}
      <div className="flex flex-col justify-between flex-1 p-3">
        {/* Part 2: Title */}
        <h3 className="mb-2 text-base font-bold text-beige-900 line-clamp-2 font-heading">
          {title}
        </h3>

        {/* Part 3: Author, Price, and Button - Same row */}
        <div className="flex items-center justify-between gap-2 mt-auto">
          <div className="flex-1 min-w-0">
            {author && (
              <p className="mb-1 text-xs text-beige-600 line-clamp-1">
                {author}
              </p>
            )}
            <p className="text-lg font-semibold text-beige-800">
              ${price.toFixed(2)}
            </p>
          </div>
          
          <button
            onClick={handleAddToCart}
            className="flex items-center justify-center w-10 h-10 text-white transition-colors rounded-full shrink-0 bg-beige-700 hover:bg-beige-800"
            aria-label="Add to cart"
          >
            <BsCart2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </a>
  );
}
