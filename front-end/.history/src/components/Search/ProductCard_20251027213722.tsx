import { Link } from "react-router-dom";

type ProductCardProps = {
  id: string | number;
  title: string;
  author: string;
  price: number;
  image: string;
  type: "book" | "series";
  onAddToCart: (id: string | number) => void;
  description?: string;
};

export function ProductCard({
  id,
  title,
  author,
  price,
  image,
  type,
  onAddToCart,
  description = "",
}: ProductCardProps) {
  const titleSlug = title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
  const productLink = `/${type}/${id}/${titleSlug}`;

  return (
    <div className="text-center flex flex-col">
      <Link to={productLink}>
        <div className="relative w-full h-80 mx-auto mb-3 overflow-hidden rounded-t-[50px]">
          <img
            src={image}
            alt={title}
            className="object-cover w-full h-full"
            loading="lazy"
          />
        </div>
      </Link>

      <div className="max-w-[200px] min-h-[100px] flex flex-col mx-auto justify-start">
        <Link to={productLink}>
          <h5 className="text-[1.1rem] font-bold text-beige-900 mb-1 line-clamp-2 hover:text-beige-700 font-heading">
            {title}
          </h5>
        </Link>
        <p className="text-[0.95rem] text-beige-700 m-0 line-clamp-3">
          {description || `by ${author}`}
        </p>
        <p className="text-[0.95rem] font-semibold text-beige-900 mt-2">
          ${price.toFixed(2)}
        </p>
      </div>
    </div>
  );
}
