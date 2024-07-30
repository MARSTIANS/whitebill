import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "../supabase";

const CalendarSection = () => {
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({ title: '', start_time: '', end_time: '', description: '', location: '', category: '' });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const { data, error } = await supabase.from('events').select('*');
    if (error) {
      console.error("Error fetching events:", error);
      return;
    }
    setEvents(data.map(event => ({
      ...event,
      start: new Date(event.start_time),
      end: new Date(event.end_time)
    })));
  };

  const handleDateSelect = (selectInfo) => {
    setIsModalOpen(true);
    setNewEvent({
      title: '',
      start_time: selectInfo.startStr,
      end_time: selectInfo.endStr,
      description: '',
      location: '',
      category: ''
    });
  };

  const handleEventAdd = async () => {
    console.log("Adding event:", newEvent);
    if (newEvent.title && newEvent.start_time && newEvent.end_time) {
      const { error } = await supabase
        .from('events')
        .insert([newEvent]);
  
      if (error) {
        console.error("Error adding event:", error);
        return;
      }
  
      const { data, fetchError } = await supabase
        .from('events')
        .select('*')
        .eq('title', newEvent.title)
        .eq('start_time', newEvent.start_time)
        .eq('end_time', newEvent.end_time)
        .single();
  
      if (fetchError) {
        console.error("Error fetching added event:", fetchError);
        return;
      }
  
      if (data && data.start_time && data.end_time) {
        setEvents([...events, { ...data, start: new Date(data.start_time), end: new Date(data.end_time) }]);
        setIsModalOpen(false);
        setNewEvent({ title: '', start_time: '', end_time: '', description: '', location: '', category: '' });
      } else {
        console.error("Invalid data returned from Supabase:", data);
      }
    } else {
      console.error("Event details are missing:", newEvent);
    }
  };
  

  const handleEventClick = (clickInfo) => {
    setCurrentEvent(clickInfo.event);
    setNewEvent({
      title: clickInfo.event.title,
      start_time: clickInfo.event.startStr,
      end_time: clickInfo.event.endStr,
      description: clickInfo.event.extendedProps.description || '',
      location: clickInfo.event.extendedProps.location || '',
      category: clickInfo.event.extendedProps.category || ''
    });
    setIsModalOpen(true);
  };

  const handleEventEdit = async () => {
    if (currentEvent && newEvent.title) {
      const { data, error } = await supabase
        .from('events')
        .update(newEvent)
        .eq('id', currentEvent.id)
        .single();

      if (error) {
        console.error("Error editing event:", error);
        return;
      }

      if (data && data.start_time && data.end_time) {
        setEvents(events.map(event => (event.id === currentEvent.id ? { ...data, start: new Date(data.start_time), end: new Date(data.end_time) } : event)));
        setIsModalOpen(false);
        setCurrentEvent(null);
        setNewEvent({ title: '', start_time: '', end_time: '', description: '', location: '', category: '' });
      } else {
        console.error("Invalid data returned from Supabase:", data);
      }
    }
  };

  const handleEventDelete = async () => {
    if (currentEvent) {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', currentEvent.id);

      if (error) {
        console.error("Error deleting event:", error);
        return;
      }

      setEvents(events.filter(event => event.id !== currentEvent.id));
      setIsModalOpen(false);
      setCurrentEvent(null);
      setNewEvent({ title: '', start_time: '', end_time: '', description: '', location: '', category: '' });
    }
  };

  const handleEventDrop = async (eventDropInfo) => {
    const updatedEvent = {
      ...eventDropInfo.event.extendedProps,
      start_time: eventDropInfo.event.startStr,
      end_time: eventDropInfo.event.endStr
    };

    const { data, error } = await supabase
      .from('events')
      .update(updatedEvent)
      .eq('id', eventDropInfo.event.id)
      .single();

    if (error) {
      console.error("Error updating event:", error);
      return;
    }

    if (data && data.start_time && data.end_time) {
      setEvents(events.map(event => (event.id === data.id ? { ...data, start: new Date(data.start_time), end: new Date(data.end_time) } : event)));
    } else {
      console.error("Invalid data returned from Supabase:", data);
    }
  };

  return (
    <div className="p-4 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Calendar</h2>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
        }}
        events={events}
        selectable={true}
        select={handleDateSelect}
        eventClick={handleEventClick}
        editable={true}
        eventDrop={handleEventDrop}
        height="auto"
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentEvent ? 'Edit Event' : 'Add New Event'}</DialogTitle>
          </DialogHeader>
          <Input
            type="text"
            placeholder="Event Title"
            value={newEvent.title}
            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
          />
          <Input
            type="text"
            placeholder="Event Description"
            value={newEvent.description}
            onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
          />
          <Input
            type="text"
            placeholder="Event Location"
            value={newEvent.location}
            onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
          />
          <Input
            type="text"
            placeholder="Event Category"
            value={newEvent.category}
            onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
          />
          <DialogFooter>
            <Button onClick={currentEvent ? handleEventEdit : handleEventAdd}>
              {currentEvent ? 'Save Changes' : 'Add Event'}
            </Button>
            {currentEvent && (
              <Button variant="destructive" onClick={handleEventDelete}>
                Delete Event
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarSection;
