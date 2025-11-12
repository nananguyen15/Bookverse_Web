import { useState, useEffect } from "react";
import { SeriesCard } from "./SeriesCard";
import seriesService from "../../services/seriesService";
import type { Series } from "../../types/api";
import { useCart } from "../../contexts/CartContext";

export function Someseries() {
  const { addToCart } = useCart();
  const [topSeries, setTopSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        setLoading(true);
        const activeSeries = await seriesService.getActiveSeries();
        setTopSeries(activeSeries.slice(0, 4));
      } catch (error) {
        console.error('Error fetching series:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSeries();
  }, []);

  const handleAddToCart = (seriesId: string | number) => {
    addToCart(String(seriesId), "series", 1);
  };

  if (loading) {
    return (
      <div className="px-16 py-6">
        <p className="text-center">Loading series...</p>
      </div>
    );
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
        {topSeries.map((series) => (
          <SeriesCard
            key={series.id}
            series={series}
            onAddToCart={handleAddToCart}
          />
        ))}
      </div>
    </div>
  );
}
