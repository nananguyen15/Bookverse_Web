import { BaseCard } from "./BaseCard";

interface Series {
  id: number;
  name: string;
  description?: string;
  image?: string;
  active: boolean;
}

type SeriesCardProps = {
  series: Series;
  onAddToCart?: (seriesId: string | number) => void;
};

export function SeriesCard({ series, onAddToCart }: SeriesCardProps) {
  if (!series) {
    return null;
  }

  return (
    <BaseCard
      id={series.id}
      title={series.name}
      author="Series Collection"
      price={0}
      image={series.image || "/placeholder-series.jpg"}
      layout="horizontal"
      onAddToCart={onAddToCart}
      detailUrl={`/series/${series.id}`}
    />
  );
}
