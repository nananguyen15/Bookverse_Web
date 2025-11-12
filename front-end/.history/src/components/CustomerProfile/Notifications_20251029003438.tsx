import { useState, useEffect } from "react";
import { FaRegBell, FaTrashAlt, FaEnvelopeOpen, FaEnvelope } from "react-icons/fa";

type NotificationCategory = "All" | "Order" | "Event" | "Promotion" | "System";

interface Notification {
  id: number;
  category: NotificationCategory;
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<NotificationCategory>("All");

  useEffect(() => {
    // Load notifications from localStorage
    const storedNotifications = JSON.parse(localStorage.getItem("userNotifications") || "[]");
    setNotifications(storedNotifications);
  }, []);

  const handleMarkAsRead = (id: number) => {
    const updatedNotifications = notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updatedNotifications);
    localStorage.setItem("userNotifications", JSON.stringify(updatedNotifications));
  };

  const handleMarkAllAsRead = () => {
    const updatedNotifications = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updatedNotifications);
    localStorage.setItem("userNotifications", JSON.stringify(updatedNotifications));
  };

  const handleDelete = (id: number) => {
    const updatedNotifications = notifications.filter((n) => n.id !== id);
    setNotifications(updatedNotifications);
    localStorage.setItem("userNotifications", JSON.stringify(updatedNotifications));
  };

  const handleDeleteAll = () => {
    if (window.confirm("Are you sure you want to delete all notifications?")) {
      setNotifications([]);
      localStorage.setItem("userNotifications", JSON.stringify([]));
    }
  };

  const filteredNotifications =
    activeTab === "All"
      ? notifications
      : notifications.filter((n) => n.category === activeTab);

  const tabs: NotificationCategory[] = ["All", "Order", "Event", "Promotion", "System"];

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex flex-wrap items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-beige-900">Notifications</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm font-medium text-beige-700 hover:text-beige-900"
          >
            Mark All as Read
          </button>
          <button
            onClick={handleDeleteAll}
            className="text-sm font-medium text-red-600 hover:text-red-800"
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
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
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
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg flex items-start justify-between border ${
                notification.read ? "bg-white border-beige-200" : "bg-beige-50 border-beige-300"
              }`}
            >
              <div className="flex items-start flex-1">
                <div
                  className={`mr-4 text-2xl ${
                    notification.read ? "text-beige-400" : "text-beige-700"
                  }`}
                >
                  {notification.read ? <FaEnvelopeOpen /> : <FaEnvelope />}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-beige-900">{notification.title}</h3>
                  <p className="text-sm text-beige-700">{notification.message}</p>
                  <p className="mt-1 text-xs text-beige-500">{notification.date}</p>
                </div>
              </div>
              <div className="flex items-center ml-4 space-x-3">
                {!notification.read && (
                  <button
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="text-sm font-medium text-beige-700 hover:text-beige-900"
                    title="Mark as read"
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
