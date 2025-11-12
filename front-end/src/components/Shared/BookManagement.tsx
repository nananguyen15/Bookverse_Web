import { BookManagement as AdminBookManagement } from "../Admin/BookManagement";

// Wrapper component for staff - reuses admin component
export function BookManagement() {
  return <AdminBookManagement />;
}
