import { SeriesManagement as AdminSeriesManagement } from "../Admin/SeriesManagement";

// Wrapper component for staff - reuses admin component
export function SeriesManagement() {
  return <AdminSeriesManagement />;
}
