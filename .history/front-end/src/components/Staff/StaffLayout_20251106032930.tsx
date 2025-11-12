import { Outlet } from "react-router-dom";
import { Navbar } from "../layout/Navbar/Navbar";
import { Footer } from "../Footer/Footer";
import { StaffSidenav } from "./StaffSidenav";

export function StaffLayout() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen px-4 py-12 bg-beige-50 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <StaffSidenav />
            <div className="md:col-span-3">
              <div className="p-6 bg-white rounded-lg shadow-md">
                <Outlet />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
