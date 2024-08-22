import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/supabase";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { useMediaQuery } from "./hooks/useMediaQuery";
import NotificationDropdown from "./NotificationDropdown";

const Remainders = () => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [reminders, setReminders] = useState([]);
  const [completedReminders, setCompletedReminders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    fetchReminders();

    const remindersSubscription = supabase
      .channel("reminders")
      .on("postgres_changes", { event: "*", schema: "public", table: "reminders" }, () => {
        fetchReminders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(remindersSubscription);
    };
  }, []);

  const fetchReminders = async () => {
    const { data, error } = await supabase.from("reminders").select("*").eq("completed", false);
    if (error) console.error("Error fetching reminders:", error);
    else setReminders(data);

    const completedData = await supabase.from("reminders").select("*").eq("completed", true);
    if (completedData.error) console.error("Error fetching completed reminders:", completedData.error);
    else setCompletedReminders(completedData.data);
  };

  const saveReminder = async () => {
    if (!title || !date || !time) {
      alert("Please fill in all fields.");
      return;
    }

    const reminderDateTime = new Date(`${date}T${time}`);
    const newReminder = {
      title,
      date: reminderDateTime.toISOString(),
      completed: false,
      is_recurring: isRecurring,
      recurrence_interval: isRecurring ? "monthly" : "none",
    };

    const { data, error } = await supabase.from("reminders").insert([newReminder]);

    if (error) {
      console.error("Error saving reminder:", error);
      return;
    }

    if (data && data.length > 0) {
      setTitle("");
      setDate("");
      setTime("");
      setIsRecurring(false);
    } else {
      console.error("No data returned after insert.");
    }
    setOpen(false);
  };

  const showNotification = async (reminder) => {
    if (Notification.permission === "granted") {
      console.log("Notification will be triggered:", reminder.title);
      try {
        new Notification("Reminder", {
          body: `It's time for: ${reminder.title}`,
          icon: "path/to/icon.png", // Add an icon if needed
          tag: reminder.id, // Unique identifier for the notification
        });
      } catch (e) {
        console.error("Notification error:", e);
      }
    } else {
      console.warn("Notifications are not permitted in this browser.");
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
  };

  const completeReminder = async (id, reminder) => {
    const { error } = await supabase.from("reminders").update({ completed: true }).eq("id", id);

    if (error) {
      console.error("Error completing reminder:", error);
      return;
    }

    const completedReminder = reminders.find((r) => r.id === id);
    setCompletedReminders((prev) => [...prev, completedReminder]);

    // If the reminder is recurring, create the next occurrence
    if (reminder.is_recurring && reminder.recurrence_interval === "monthly") {
      const nextDate = new Date(reminder.date);
      nextDate.setMonth(nextDate.getMonth() + 1);

      const newReminder = {
        title: reminder.title,
        date: nextDate.toISOString(),
        completed: false,
        is_recurring: true,
        recurrence_interval: "monthly",
      };

      await supabase.from("reminders").insert([newReminder]);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      reminders.forEach((reminder) => {
        const reminderTime = new Date(reminder.date);
        if (reminderTime <= now) {
          showNotification(reminder);
          completeReminder(reminder.id, reminder);
        }
      });
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [reminders]);

  const filteredReminders = reminders.filter((reminder) =>
    reminder.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex justify-between items-center ">
        <h2 className="text-2xl font-bold mb-4">Reminders</h2>
        <NotificationDropdown />
      </div>
      <Card className="bg-gray-50 p-4">
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
                  isRecurring={isRecurring}
                  setIsRecurring={setIsRecurring}
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
                    isRecurring={isRecurring}
                    setIsRecurring={setIsRecurring}
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

        <h2 className="text-xl font-bold mt-8">Upcoming Reminders</h2>
        <ul className="mt-4">
          {filteredReminders.map((reminder) => (
            <li key={reminder.id} className="mb-2">
              {reminder.title} - {format(new Date(reminder.date), "dd/MM/yyyy HH:mm")}
            </li>
          ))}
        </ul>

        <h2 className="text-xl font-bold mt-8">Completed Reminders</h2>
        <ul className="mt-4">
          {completedReminders.map((reminder) => (
            <li key={reminder.id} className="mb-2">
              {reminder.title} - {format(new Date(reminder.date), "dd/MM/yyyy HH:mm")}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
};

const AddReminderForm = ({
  title,
  setTitle,
  date,
  setDate,
  time,
  setTime,
  isRecurring,
  setIsRecurring,
  saveReminder,
}) => (
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

    <div className="mb-6">
      <Label htmlFor="recurring" className="block text-sm font-medium text-gray-700 mb-2">
        Recurring Reminder
      </Label>
      <Input
        id="recurring"
        type="checkbox"
        checked={isRecurring}
        onChange={(e) => setIsRecurring(e.target.checked)}
        className="mr-2"
      />
      <span>Repeat Monthly</span>
    </div>

    <Button onClick={saveReminder} className="mt-4 w-full text-white rounded-md py-2 transition-colors">
      Save Reminder
    </Button>
  </div>
);

export default Remainders;
