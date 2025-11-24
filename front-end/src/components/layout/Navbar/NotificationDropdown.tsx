import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { IoMdNotifications } from "react-icons/io";
import { FaEnvelopeOpen, FaBell } from "react-icons/fa";
import { notificationApi } from "../../../api";
import type { Notification } from "../../../api/endpoints/notification.api";
import { useAuth } from "../../../contexts/AuthContext";

export function NotificationDropdown() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Determine notification route based on user role
  const getNotificationRoute = () => {
    if (!user || !user.roles) return "/profile/notifications";

    if (user.roles.includes("ADMIN")) {
      return "/admin/my-notifications";
    } else if (user.roles.includes("STAFF")) {
      return "/staff/my-notifications";
    } else {
      return "/profile/notifications";
    }
  };

  const notificationRoute = getNotificationRoute();

  // Load unread count on component mount and refresh periodically
  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const count = await notificationApi.getUnreadCount();
        setUnreadCount(count);
      } catch (error) {
        console.error("Error loading unread count:", error);
      }
    };

    loadUnreadCount();

    // Refresh every 30 seconds to keep badge in sync
    const interval = setInterval(loadUnreadCount, 30000);

    // Refresh when window gains focus (user comes back from another tab/page)
    const handleFocus = () => loadUnreadCount();
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Load notifications when dropdown opens
  useEffect(() => {
    const loadNotifications = async () => {
      if (!isOpen) return;
      try {
        setLoading(true);
        const data = await notificationApi.getFirst5();
        setNotifications(data);
        // Refresh unread count when opening dropdown
        const count = await notificationApi.getUnreadCount();
        setUnreadCount(count);
      } catch (error) {
        console.error("Error loading notifications:", error);
      } finally {
        setLoading(false);
      }
    };
    loadNotifications();
  }, [isOpen]);
  const recentNotifications = notifications;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-beige-700 hover:text-beige-900"
      >
        <IoMdNotifications className="w-7 h-7" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-[10px] font-semibold text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute left-0 z-[9999] w-80 mt-2 origin-top-left bg-white rounded-md shadow-xl border border-beige-200"
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="p-4 border-b border-beige-200">
            <h3 className="font-semibold text-beige-900">Notifications</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <p className="px-4 py-8 text-sm text-center text-beige-500">
                Loading...
              </p>
            ) : recentNotifications.length > 0 ? (
              recentNotifications.map((notification) => (
                <Link
                  key={notification.id}
                  to={notificationRoute}
                  className={`block px-4 py-3 text-sm hover:bg-beige-50 border-b border-beige-100 ${!notification.read ? "bg-beige-50" : "bg-white"
                    }`}
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-start">
                    <div
                      className={`mr-3 mt-1 ${!notification.read ? "text-beige-700" : "text-beige-400"
                        }`}
                    >
                      {!notification.read ? <FaBell /> : <FaEnvelopeOpen />}
                    </div>
                    <div className="flex-1">
                      <p
                        className={`line-clamp-2 ${!notification.read
                          ? "font-semibold text-beige-900"
                          : "text-beige-700"
                          }`}
                      >
                        {notification.content}
                      </p>
                      <p
                        className={`text-xs mt-1 ${!notification.read
                          ? "text-beige-600"
                          : "text-beige-500"
                          }`}
                      >
                        {new Date(notification.createdAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
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
              to={notificationRoute}
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
