import { BookManagementNew } from "../Admin/BookManagementNew";
import { useLocation } from "react-router-dom";

// Wrapper component for staff - reuses admin component
// Staff routes already have StaffLayout, so we pass a flag to avoid nested layouts
export function BookManagement() {
  const location = useLocation();
  const isStaffRoute = location.pathname.startsWith("/staff");

  // For staff routes, the component will be wrapped by StaffLayout already
  // So we need to modify BookManagementNew to accept a noLayout prop
  // For now, just render it - the component itself needs to be aware of the context
  return <BookManagementNew />;
}
