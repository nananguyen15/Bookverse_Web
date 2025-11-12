import { ManageReview as AdminManageReview } from "../Admin/ManageReview";

// Wrapper component for staff - reuses admin component
export function ManageReview() {
  return <AdminManageReview />;
}
