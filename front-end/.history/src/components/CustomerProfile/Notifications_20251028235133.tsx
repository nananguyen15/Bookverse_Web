import React, { useState } from "react";
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

// Mock data
const mockNotifications: Notification[] = [
  { id: 1, category: "Order", title: "Order Shipped", message: "Your order #BV-17292838 has been shipped.", date: "2025-10-28", read: false },
  { id: 2, category: "Promotion", title: "Black Friday Sale!", message: "Get up to 50% off on selected books.", date: "2025-10-27", read: false },
  { id: 3, category: "System", title: "Password Updated", message: "Your password was successfully updated.", date: "2025-10-26", read: true },
  { id: 4, category: "Order", title: "Order Delivered", message: "Your order #BV-17292837 has been delivered.", date: "2025-10-25", read: true },
  { id: 5, category: "Event", title: "Author Meet & Greet", message: "Join us for a live session with Jane Doe.", date: "2025-10-24", read: false },
  { id: 6, category: "Promotion", title: "New Vouchers", message: "You have received new discount vouchers.", date: "2025-10-29", read: false },
];


export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [activeTab, setActiveTab] = useState<NotificationCategory>("All");

  const handleMarkAsRead = (id: number) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const handleDelete = (id: number) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const handleDeleteAll = () => {
      if(window.confirm("Are you sure you want to delete all notifications?")) {
        setNotifications([]);
      }
  };

  const filteredNotifications =
    activeTab === "All"
      ? notifications
      : notifications.filter((n) => n.category === activeTab);

  const tabs: NotificationCategory[] = ["All", "Order", "Event", "Promotion", "System"];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Notifications</h2>
        <div className="flex items-center space-x-4">
            <button onClick={handleMarkAllAsRead} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                Mark All as Read
            </button>
            <button onClick={handleDeleteAll} className="text-sm font-medium text-red-600 hover:text-red-800">
                Remove All
            </button>
        </div>
      </div>

      <div className="mb-4 border-b border-gray-200">
        <nav className="flex -mb-px space-x-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
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
              className={`p-4 rounded-lg flex items-start justify-between ${
                notification.read ? "bg-white" : "bg-indigo-50"
              }`}
            >
              <div className="flex items-start">
                <div className={`mr-4 text-2xl ${notification.read ? 'text-gray-400' : 'text-indigo-600'}`}>
                    {notification.read ? <FaEnvelopeOpen /> : <FaEnvelope />}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                  <p className="text-sm text-gray-600">{notification.message}</p>
                  <p className="mt-1 text-xs text-gray-400">{notification.date}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {!notification.read && (
                  <button
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                    title="Mark as read"
                  >
                    Mark Read
                  </button>
                )}
                <button
                  onClick={() => handleDelete(notification.id)}
                  className="text-gray-400 hover:text-red-600"
                   title="Delete notification"
                >
                  <FaTrashAlt />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-gray-500">
            <FaRegBell className="mx-auto mb-4 text-4xl text-gray-400" />
            <p>No notifications here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
