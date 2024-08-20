import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/supabase";
import { format } from "date-fns";

const Remainders = () => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    fetchReminders();
    requestNotificationPermission();
  }, []);

  // Request notification permission from the user
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

  // Fetch existing reminders from Supabase
  const fetchReminders = async () => {
    const { data, error } = await supabase.from("reminders").select("*");
    if (error) console.error("Error fetching reminders:", error);
    else setReminders(data);
  };

  // Save a new reminder to Supabase
  const saveReminder = async () => {
    if (!title || !date || !time) {
      alert("Please fill in all fields.");
      return;
    }

    const reminderDateTime = new Date(`${date}T${time}`);
    const newReminder = { title, date: reminderDateTime.toISOString() };

    const { data, error } = await supabase.from("reminders").insert([newReminder]);

    if (error) {
      console.error("Error saving reminder:", error);
      return;
    }

    if (data && data.length > 0) {
      setReminders([...reminders, data[0]]);
      setTitle("");
      setDate("");
      setTime("");
    } else {
      console.error("No data returned after insert.");
    }
  };

  // Show a notification if the reminder time is reached
  const showNotification = (reminder) => {
    if (Notification.permission === "granted") {
      new Notification("Reminder", {
        body: `It's time for: ${reminder.title}`,
      });
    }
  };

  // Check reminders every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      reminders.forEach((reminder) => {
        const reminderTime = new Date(reminder.date);
        if (reminderTime <= now) {
          showNotification(reminder);
          deleteReminder(reminder.id); // Remove the reminder after it triggers
        }
      });
    }, 60000); // Check every 60 seconds

    return () => clearInterval(interval);
  }, [reminders]);

  // Delete a reminder after it triggers
  const deleteReminder = async (id) => {
    const { error } = await supabase.from("reminders").delete().eq("id", id);
    if (error) console.error("Error deleting reminder:", error);
    else setReminders(reminders.filter((reminder) => reminder.id !== id));
  };

  return (
    <div className="flex flex-col min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Reminders</h1>

      <div className="mb-6">
        <Label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">Reminder Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter reminder title"
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="mb-6">
        <Label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">Date</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="mb-6">
        <Label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">Time</Label>
        <Input
          id="time"
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <Button onClick={saveReminder} className="mt-4 w-full text-white rounded-md py-2 transition-colors">
        Add Reminder
      </Button>

      <h2 className="text-xl font-bold mt-8">Upcoming Reminders</h2>
      <ul className="mt-4">
        {reminders.map((reminder) => (
          <li key={reminder.id} className="mb-2">
            {reminder.title} - {format(new Date(reminder.date), "dd/MM/yyyy HH:mm")}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Remainders;
