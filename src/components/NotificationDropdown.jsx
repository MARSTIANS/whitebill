import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { format, subDays } from "date-fns";
import { supabase } from "@/supabase"; // Ensure this imports the correctly configured Supabase client

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();

    const notificationsSubscription = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notificationsSubscription);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .gte("created_at", subDays(new Date(), 1).toISOString())
        .order("created_at", { ascending: false }); // Sort by created_at in descending order

      if (error) {
        throw error;
      }

      setNotifications(data);
      setUnreadCount(data.filter((notification) => !notification.read).length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter((notification) => !notification.read);

    if (unreadNotifications.length > 0) {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .in("id", unreadNotifications.map((notification) => notification.id));

      if (error) {
        console.error("Error marking notifications as read:", error);
        return;
      }

      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
    }
  };

  return (
    <Popover onOpenChange={markAllAsRead}>
      <PopoverTrigger asChild>
        <button className="relative hover:text-gray-700">
          <Bell className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute bottom-3 left-3 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4 mr-8">
        <h3 className="font-bold mb-2">Notifications</h3>
        {notifications.length === 0 ? (
          <p>No notifications</p>
        ) : (
          <ul>
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className={`mb-2 ${notification.read ? "text-gray-500" : "text-black"}`}
              >
                <div>
                  <p>{notification.message}</p>
                  <p className="text-xs text-gray-400">
                    {format(new Date(notification.created_at), "dd/MM/yyyy HH:mm")}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationDropdown;
