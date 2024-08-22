import React from "react";
import { Bell, CheckCircle } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

const NotificationDropdown = ({ notifications, unreadCount, markAsRead }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative">
          <Bell className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4">
        <h3 className="font-bold mb-2">Notifications</h3>
        {notifications.length === 0 ? (
          <p>No notifications</p>
        ) : (
          <ul>
            {notifications.map((notification) => (
              <li key={notification.id} className={`mb-2 ${notification.read ? "text-gray-500" : "text-black"}`}>
                <button onClick={() => markAsRead(notification.id)}>
                  {notification.message}
                </button>
                {!notification.read && <CheckCircle className="inline ml-2 text-green-500" />}
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationDropdown;
