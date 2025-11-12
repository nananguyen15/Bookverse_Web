import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { IoMdNotifications } from "react-icons/io";
import { FaEnvelopeOpen, FaBell } from "react-icons/fa";

interface Notification {
  id: number;
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Load notifications from localStorage
    const storedNotifications = JSON.parse(
      localStorage.getItem("userNotifications") || "[]"
    );
    setNotifications(storedNotifications);
  }, [isOpen]); // Reload when dropdown opens

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
          <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 z-50 w-80 mt-2 origin-top-right bg-white rounded-md shadow-lg border border-beige-200"
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="p-4 border-b border-beige-200">
            <h3 className="font-semibold text-beige-900">Notifications</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {recentNotifications.length > 0 ? (
              recentNotifications.map((notification) => (
                <Link
                  key={notification.id}
                  to="/profile/notifications"
                  className={`block px-4 py-3 text-sm hover:bg-beige-50 border-b border-beige-100 ${
                    !notification.read ? "bg-beige-50" : "bg-white"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-start">
                    <div
                      className={`mr-3 mt-1 ${
                        !notification.read ? "text-beige-700" : "text-beige-400"
                      }`}
                    >
                      {!notification.read ? <FaBell /> : <FaEnvelopeOpen />}
                    </div>
                    <div className="flex-1">
                      <p
                        className={`truncate ${
                          !notification.read
                            ? "font-semibold text-beige-900"
                            : "text-beige-700"
                        }`}
                      >
                        {notification.title}
                      </p>
                      <p
                        className={`text-xs ${
                          !notification.read
                            ? "text-beige-600"
                            : "text-beige-500"
                        }`}
                      >
                        {notification.date}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="px-4 py-8 text-sm text-center text-beige-500">
                No new notifications.
              </p>
            )}
          </div>
          <div className="p-2 border-t border-beige-200">
            <Link
              to="/profile/notifications"
              className="block w-full px-4 py-2 text-sm font-medium text-center rounded-md text-beige-700 hover:bg-beige-100"
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
