import { useState, useEffect } from "react";
import { SeriesCard } from "./SeriesCard";
import { useCart } from "../../contexts/CartContext";

// Tạm thời định nghĩa Series type (sau này sẽ lấy từ backend)
interface Series {
  id: number;
  name: string;
  description?: string;
  image?: string;
  active: boolean;
}

export function Someseries() {
  const { addToCart } = useCart();
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Khi backend có API series, fetch từ API
    // Tạm thời dùng empty array
    setLoading(false);
    setSeries([]);
  }, []);

  const handleAddToCart = (seriesId: string | number) => {
    addToCart(String(seriesId), "series", 1);
  };

  if (loading) {
    return (
      <div className="px-16 py-6">
        <p className="text-center text-brown-600">Đang tải series...</p>
      </div>
    );
  }

  if (series.length === 0) {
    return null; // Không hiển thị nếu chưa có data
  }

  return (
    <div className="px-16 py-6">
      {/* Title and See All */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold font-heading text-beige-900">
          Series
        </h2>
        <a
          href="/series"
          className="text-base font-medium transition-colors text-beige-700 hover:text-beige-900 hover:underline"
        >
          See All →
        </a>
      </div>

      {/* Series Grid - 2 columns, 2 rows */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {series.slice(0, 4).map((item) => (
          <SeriesCard
            key={item.id}
            series={item}
            onAddToCart={handleAddToCart}
          />
        ))}
      </div>
    </div>
  );
}
