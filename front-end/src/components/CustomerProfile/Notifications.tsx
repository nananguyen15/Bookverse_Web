import { useState, useEffect } from "react";
import {
  FaRegBell,
  FaTrashAlt,
  FaEnvelopeOpen,
  FaEnvelope,
} from "react-icons/fa";
import { notificationApi } from "../../api";
import type { Notification } from "../../api/endpoints/notification.api";

type NotificationCategory = "All" | "Order" | "Event" | "Promotion" | "System";

function getCategory(type: string): NotificationCategory {
  if (type.includes("ORDER")) return "Order";
  if (type.includes("EVENT")) return "Event";
  if (type.includes("PROMOTION")) return "Promotion";
  return "System";
}

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<NotificationCategory>("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationApi.getMyNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      console.log("Marking notification as read:", id);

      // WORKAROUND: Backend mark-one-read endpoint has issues (500 error)
      // For now, we'll update locally and hope backend fixes the endpoint
      // Alternative: use markAllRead if only this notification is unread

      try {
        await notificationApi.markAsRead(id);
        console.log("Successfully marked as read via API");
      } catch (apiError: any) {
        console.warn("API call failed, updating locally only:", apiError?.response?.data);
        // Update local state only as fallback
        const updatedNotifications = notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        );
        setNotifications(updatedNotifications);
        return; // Don't reload, just use local update
      }

      // Reload notifications to get updated state from backend
      await loadNotifications();
    } catch (error: any) {
      console.error("Error marking notification as read:", error);
      console.error("Error response:", error?.response?.data);
      console.error("Error status:", error?.response?.status);
      alert(`Backend error: ${error?.response?.data?.message || error?.message}\n\nPlease contact backend team to fix the /mark-one-read endpoint.`);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllRead();
      const updatedNotifications = notifications.map((n) => ({
        ...n,
        read: true,
      }));
      setNotifications(updatedNotifications);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await notificationApi.deleteMyNotification(id);
      const updatedNotifications = notifications.filter((n) => n.id !== id);
      setNotifications(updatedNotifications);
    } catch (error) {
      console.error("Error deleting notification:", error);
      alert("Failed to delete notification");
    }
  };

  const handleDeleteAll = async () => {
    if (window.confirm("Are you sure you want to delete all notifications?")) {
      try {
        // Delete each notification individually
        await Promise.all(notifications.map(n => notificationApi.deleteMyNotification(n.id)));
        setNotifications([]);
      } catch (error) {
        console.error("Error deleting all notifications:", error);
        alert("Failed to delete all notifications");
      }
    }
  };

  const filteredNotifications =
    activeTab === "All"
      ? notifications
      : notifications.filter((n) => getCategory(n.type) === activeTab);

  const tabs: NotificationCategory[] = [
    "All",
    "Order",
    "Event",
    "Promotion",
    "System",
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex flex-wrap items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-beige-900">Notifications</h2>
          <p className="text-sm text-beige-600 mt-1">
            Total: {notifications.length} {notifications.length === 1 ? 'notification' : 'notifications'}
            {unreadCount > 0 && (
              <span className="ml-2 text-red-600 font-semibold">
                • {unreadCount} unread
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm font-medium text-beige-700 hover:text-beige-900"
            disabled={unreadCount === 0}
          >
            Mark All as Read
          </button>
          <button
            onClick={handleDeleteAll}
            className="text-sm font-medium text-red-600 hover:text-red-800"
            disabled={notifications.length === 0}
          >
            Remove All
          </button>
        </div>
      </div>

      <div className="mb-4 border-b border-beige-200">
        <nav className="flex -mb-px space-x-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === tab
                ? "border-beige-700 text-beige-900"
                : "border-transparent text-beige-600 hover:text-beige-900 hover:border-beige-300"
                }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-beige-600">
            <p>Loading notifications...</p>
          </div>
        ) : filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg flex items-start justify-between border ${notification.read
                ? "bg-white border-beige-200"
                : "bg-beige-50 border-beige-300"
                }`}
            >
              <div className="flex items-start flex-1">
                <div
                  className={`mr-4 text-2xl ${notification.read ? "text-beige-400" : "text-beige-700"
                    }`}
                >
                  {notification.read ? <FaEnvelopeOpen /> : <FaEnvelope />}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-beige-900">
                    {getCategory(notification.type)}
                  </h3>
                  <p className="text-sm text-beige-700">
                    {notification.content}
                  </p>
                  <p className="mt-1 text-xs text-beige-500">
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
              <div className="flex items-center ml-4 space-x-3">
                {!notification.read && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleMarkAsRead(notification.id);
                    }}
                    className="text-sm font-medium text-beige-700 hover:text-beige-900 cursor-pointer hover:underline"
                    title="Mark as read"
                    type="button"
                  >
                    Mark Read
                  </button>
                )}
                <button
                  onClick={() => handleDelete(notification.id)}
                  className="text-beige-400 hover:text-red-600"
                  title="Delete notification"
                >
                  <FaTrashAlt />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-beige-600">
            <FaRegBell className="mx-auto mb-4 text-4xl text-beige-400" />
            <p>No notifications here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
