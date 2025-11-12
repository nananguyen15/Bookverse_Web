import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { IoMdNotifications } from "react-icons/io";
import { FaEnvelopeOpen, FaBell } from "react-icons/fa";

// Re-using the mock data structure, assuming it's fetched/managed globally (e.g., via context)
interface Notification {
  id: number;
  title: string;
  message: string;
  date: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
    { id: 1, title: "Order Shipped", message: "Your order #BV-17292838 has been shipped.", date: "2025-10-28", read: false },
    { id: 2, title: "Black Friday Sale!", message: "Get up to 50% off on selected books.", date: "2025-10-27", read: false },
    { id: 3, title: "Password Updated", message: "Your password was successfully updated.", date: "2025-10-26", read: true },
    { id: 4, title: "Order Delivered", message: "Your order #BV-17292837 has been delivered.", date: "2025-10-25", read: true },
    { id: 5, title: "Author Meet & Greet", message: "Join us for a live session with Jane Doe.", date: "2025-10-24", read: false },
    { id: 6, title: "New Vouchers", message: "You have received new discount vouchers.", date: "2025-10-29", read: false },
];


export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-beige-700 hover:text-beige-900"
      >
        <IoMdNotifications className="w-7 h-7" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center w-4 h-4 text-xs text-white bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 z-50 w-80 mt-2 origin-top-right bg-white rounded-md shadow-lg"
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="p-4">
            <h3 className="font-semibold text-gray-800">Notifications</h3>
          </div>
          <div className="border-t border-gray-100">
            {recentNotifications.length > 0 ? (
              recentNotifications.map((notification) => (
                <Link
                  key={notification.id}
                  to="/profile/notifications"
                  className={`block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 ${
                    !notification.read ? "font-bold" : ""
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-start">
                    <div className={`mr-3 mt-1 ${!notification.read ? 'text-indigo-500' : 'text-gray-400'}`}>
                        {!notification.read ? <FaBell /> : <FaEnvelopeOpen />}
                    </div>
                    <div>
                        <p className="truncate">{notification.title}</p>
                        <p className={`text-xs ${!notification.read ? 'text-gray-600' : 'text-gray-400'}`}>{notification.date}</p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="px-4 py-3 text-sm text-center text-gray-500">
                No new notifications.
              </p>
            )}
          </div>
          <div className="p-2 border-t border-gray-100">
            <Link
              to="/profile/notifications"
              className="block w-full px-4 py-2 text-sm font-medium text-center text-indigo-600 rounded-md hover:bg-indigo-50"
              onClick={() => setIsOpen(false)}
            >
              View All Notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
