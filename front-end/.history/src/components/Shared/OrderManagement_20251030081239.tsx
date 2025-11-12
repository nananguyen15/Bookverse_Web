import { OrderManagement as AdminOrderManagement } from "../Admin/OrderManagement";

// Wrapper component for staff - reuses admin component
export function OrderManagement() {
  return <AdminOrderManagement />;
}
