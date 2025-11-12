import { BaseCard } from "./BaseCard";
import type { Series } from "../../data/series";

type SeriesCardProps = {
  series: Series;
  onAddToCart?: (seriesId: number) => void;
};

export function SeriesCard({ series, onAddToCart }: SeriesCardProps) {
  if (!series) {
    return null;
  }

  // Mock author name based on author_id (replace with real data later)
  const authorName = `Author ${series.author_id}`;

  return (
    <BaseCard
      id={series.id}
      title={series.title}
      author={authorName}
      price={series.price}
      image={series.image}
      layout="horizontal"
      onAddToCart={onAddToCart}
      detailUrl={`/series/${series.id}`}
    />
  );
}
