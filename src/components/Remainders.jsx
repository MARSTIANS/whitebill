import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/supabase"; // Make sure this imports the correctly configured client
import { format, subDays } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { useMediaQuery } from "./hooks/useMediaQuery";
import NotificationDropdown from "./NotificationDropdown";

const Remainders = () => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reminders, setReminders] = useState([]);
  const [completedReminders, setCompletedReminders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    fetchReminders();
    fetchNotifications();
    requestNotificationPermission();
    
    // Set up real-time subscription for reminders
    const remindersSubscription = supabase
      .channel('reminders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reminders' }, () => {
        fetchReminders(); // Refetch reminders on any change
      })
      .subscribe();

    // Set up real-time subscription for notifications
    const notificationsSubscription = supabase
      .channel('notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        fetchNotifications(); // Refetch notifications on any change
      })
      .subscribe();

    return () => {
      supabase.removeChannel(remindersSubscription);
      supabase.removeChannel(notificationsSubscription);
    };
  }, []);

  const requestNotificationPermission = () => {
    if (Notification.permission === "granted") {
      return;
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          console.log("Notification permission granted.");
        }
      });
    }
  };

  const fetchReminders = async () => {
    const { data, error } = await supabase.from("reminders").select("*").eq("completed", false);
    if (error) console.error("Error fetching reminders:", error);
    else setReminders(data);

    const completedData = await supabase.from("reminders").select("*").eq("completed", true);
    if (completedData.error) console.error("Error fetching completed reminders:", completedData.error);
    else setCompletedReminders(completedData.data);
  };

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .gte("created_at", subDays(new Date(), 1).toISOString()); // Fetch notifications from the last day

      if (error) {
        throw error;
      }

      setNotifications(data);
      setUnreadCount(data.filter((notification) => !notification.read).length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const saveReminder = async () => {
    if (!title || !date || !time) {
      alert("Please fill in all fields.");
      return;
    }

    const reminderDateTime = new Date(`${date}T${time}`);
    const newReminder = { title, date: reminderDateTime.toISOString(), completed: false };

    const { data, error } = await supabase.from("reminders").insert([newReminder]);

    if (error) {
      console.error("Error saving reminder:", error);
      return;
    }

    if (data && data.length > 0) {
      setTitle("");
      setDate("");
      setTime("");
    } else {
      console.error("No data returned after insert.");
    }
    setOpen(false);
  };

  const showNotification = async (reminder) => {
    if (Notification.permission === "granted") {
      new Notification("Reminder", {
        body: `It's time for: ${reminder.title}`,
      });
    }
    await addNotification(reminder.title, reminder.id);
  };

  const addNotification = async (message, reminderId) => {
    const newNotification = { message, reminder_id: reminderId, read: false };

    const { data, error } = await supabase.from("notifications").insert([newNotification]);

    if (error) {
      console.error("Error saving notification:", error);
      return;
    }

    if (data && data.length > 0) {
      setUnreadCount((prev) => prev + 1);
    }
  };

  const completeReminder = async (id) => {
    const { error } = await supabase
      .from("reminders")
      .update({ completed: true })
      .eq("id", id);

    if (error) {
      console.error("Error completing reminder:", error);
      return;
    }

    const completedReminder = reminders.find((reminder) => reminder.id === id);
    setCompletedReminders((prev) => [...prev, completedReminder]);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      reminders.forEach((reminder) => {
        const reminderTime = new Date(reminder.date);
        if (reminderTime <= now) {
          showNotification(reminder);
          completeReminder(reminder.id);
        }
      });
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [reminders]);

  const markAsRead = async (id) => {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id);

    if (error) {
      console.error("Error marking notification as read:", error);
      return;
    }

    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
    setUnreadCount((prev) => Math.max(prev - 1, 0));
  };

  const filteredReminders = reminders.filter((reminder) =>
    reminder.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Reminders</h1>
        <NotificationDropdown
          notifications={notifications}
          unreadCount={unreadCount}
          markAsRead={markAsRead}
        />
      </div>

      {/* Search and Add Button */}
      <div className="flex justify-between mb-6">
        <Input
          type="text"
          placeholder="Search Reminders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full mr-4"
        />
        {isDesktop ? (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Add Reminder</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Reminder</DialogTitle>
              </DialogHeader>
              <AddReminderForm
                title={title}
                setTitle={setTitle}
                date={date}
                setDate={setDate}
                time={time}
                setTime={setTime}
                saveReminder={saveReminder}
              />
            </DialogContent>
          </Dialog>
        ) : (
          <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
              <Button variant="outline">Add Reminder</Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader className="text-left">
                <DrawerTitle>Add Reminder</DrawerTitle>
              </DrawerHeader>
              <div className="p-4">
                <AddReminderForm
                  title={title}
                  setTitle={setTitle}
                  date={date}
                  setDate={setDate}
                  time={time}
                  setTime={setTime}
                  saveReminder={saveReminder}
                />
              </div>
              <DrawerFooter className="pt-2">
                <DrawerClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        )}
      </div>

      {/* Upcoming Reminders */}
      <h2 className="text-xl font-bold mt-8">Upcoming Reminders</h2>
      <ul className="mt-4">
        {filteredReminders.map((reminder) => (
          <li key={reminder.id} className="mb-2">
            {reminder.title} - {format(new Date(reminder.date), "dd/MM/yyyy HH:mm")}
          </li>
        ))}
      </ul>

      {/* Completed Reminders */}
      <h2 className="text-xl font-bold mt-8">Completed Reminders</h2>
      <ul className="mt-4">
        {completedReminders.map((reminder) => (
          <li key={reminder.id} className="mb-2">
            {reminder.title} - {format(new Date(reminder.date), "dd/MM/yyyy HH:mm")}
          </li>
        ))}
      </ul>
    </div>
  );
};

const AddReminderForm = ({ title, setTitle, date, setDate, time, setTime, saveReminder }) => (
  <div>
    <div className="mb-6">
      <Label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
        Reminder Title
      </Label>
      <Input
        id="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter reminder title"
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>

    <div className="mb-6">
      <Label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
        Date
      </Label>
      <Input
        id="date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>

    <div className="mb-6">
      <Label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
        Time
      </Label>
      <Input
        id="time"
        type="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>

    <Button onClick={saveReminder} className="mt-4 w-full text-white rounded-md py-2 transition-colors">
      Save Reminder
    </Button>
  </div>
);

export default Remainders;
