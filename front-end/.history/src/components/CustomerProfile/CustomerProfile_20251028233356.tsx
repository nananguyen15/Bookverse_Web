import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  User,
  MapPin,
  Lock,
  ClipboardList,
  MessageSquare,
  Bell,
  Star,
  LogOut,
} from "lucide-react";
import { Navbar } from "../Navbar/Navbar";
import { Footer } from "../Footer/Footer";

const sidebarNavItems = [
  {
    display: "Thông tin tài khoản",
    icon: <User size={20} />,
    to: "/account/profile",
    section: "profile",
    subItems: [
      {
        display: "Hồ sơ cá nhân",
        to: "/account/profile",
        section: "profile",
      },
      {
        display: "Địa chỉ",
        to: "/account/addresses",
        section: "addresses",
      },
      {
        display: "Đổi mật khẩu",
        to: "/account/change-password",
        section: "change-password",
      },
    ],
  },
  {
    display: "Đơn hàng của tôi",
    icon: <ClipboardList size={20} />,
    to: "/account/orders",
    section: "orders",
  },
  {
    display: "Thông báo",
    icon: <Bell size={20} />,
    to: "/account/notifications",
    section: "notifications",
  },
  {
    display: "Nhận xét của tôi",
    icon: <Star size={20} />,
    to: "/account/reviews",
    section: "reviews",
  },
];

export function CustomerProfile() {
  const location = useLocation();
  const [isAccountInfoOpen, setAccountInfoOpen] = useState(true);

  const getActiveSection = () => {
    const currentPath = location.pathname;
    if (currentPath.includes("profile")) return "profile";
    if (currentPath.includes("addresses")) return "addresses";
    if (currentPath.includes("change-password")) return "change-password";
    if (currentPath.includes("orders")) return "orders";
    if (currentPath.includes("notifications")) return "notifications";
    if (currentPath.includes("reviews")) return "reviews";
    return "profile";
  };

  const activeSection = getActiveSection();

  return (
    <>
      <Navbar />
      <div className="bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="p-4 bg-white rounded-lg shadow">
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src="https://via.placeholder.com/64"
                    alt="User Avatar"
                    className="w-16 h-16 rounded-full"
                  />
                  <div>
                    <p className="font-semibold">Nguyễn Văn A</p>
                    <p className="text-sm text-gray-500">Thành viên Bạc</p>
                  </div>
                </div>
                <nav className="space-y-2">
                  {sidebarNavItems.map((item) => (
                    <div key={item.section}>
                      <div
                        className={`flex items-center justify-between p-3 rounded-md cursor-pointer ${
                          item.subItems &&
                          item.subItems.some((si) => si.section === activeSection)
                            ? "bg-red-100 text-red-600"
                            : "hover:bg-gray-100"
                        }`}
                        onClick={() =>
                          item.subItems
                            ? setAccountInfoOpen(!isAccountInfoOpen)
                            : null
                        }
                      >
                        <Link to={item.to} className="flex items-center gap-3">
                          {item.icon}
                          <span className="font-medium">{item.display}</span>
                        </Link>
                        {item.subItems && (
                          <svg
                            className={`w-4 h-4 transition-transform ${
                              isAccountInfoOpen ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 9l-7 7-7-7"
                            ></path>
                          </svg>
                        )}
                      </div>
                      {item.subItems && isAccountInfoOpen && (
                        <div className="pl-8 mt-2 space-y-2 border-l-2 border-gray-200">
                          {item.subItems.map((subItem) => (
                            <Link
                              key={subItem.section}
                              to={subItem.to}
                              className={`block p-2 rounded-md ${
                                activeSection === subItem.section
                                  ? "text-red-600 font-semibold"
                                  : "hover:bg-gray-100"
                              }`}
                            >
                              {subItem.display}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  <Link
                    to="/logout"
                    className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-100"
                  >
                    <LogOut size={20} />
                    <span className="font-medium">Đăng xuất</span>
                  </Link>
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <main className="lg:col-span-3">
              <div className="p-6 bg-white rounded-lg shadow">
                <Outlet />
              </div>
            </main>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
