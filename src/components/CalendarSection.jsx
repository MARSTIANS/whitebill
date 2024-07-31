import React, { useState, useEffect, useRef, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from '../supabase';

const CATEGORIES = [
  { value: 'work', label: 'Work' },
  { value: 'personal', label: 'Personal' },
  { value: 'other', label: 'Other' },
];

const CalendarSection = () => {
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', description: '', start: '', end: '', location: '', category: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState(null);
  const calendarRef = useRef(null);

  const fetchEvents = useCallback(async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*');
    if (error) {
      console.error('Error fetching events:', error);
    } else {
      const formattedEvents = data.map(event => ({
        id: event.id,
        title: event.title,
        start: event.start_time,
        end: event.end_time,
        allDay: !event.start_time.includes('T'), // Determine if it's an all-day event
        extendedProps: {
          description: event.description,
          location: event.location,
          category: event.category
        }
      }));
      setEvents(formattedEvents);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleDateSelect = (selectInfo) => {
    setIsModalOpen(true);
    setNewEvent({
      title: '',
      description: '',
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      location: '',
      category: ''
    });
    setIsEditing(false);
  };

  const handleEventClick = (clickInfo) => {
    setIsModalOpen(true);
    setNewEvent({
      id: clickInfo.event.id,
      title: clickInfo.event.title,
      description: clickInfo.event.extendedProps.description,
      start: clickInfo.event.startStr,
      end: clickInfo.event.endStr,
      location: clickInfo.event.extendedProps.location,
      category: clickInfo.event.extendedProps.category
    });
    setIsEditing(true);
  };

  const handleEventAdd = async () => {
    if (newEvent.title) {
      const eventToAdd = {
        title: newEvent.title,
        description: newEvent.description,
        start_time: newEvent.start,
        end_time: newEvent.end,
        location: newEvent.location,
        category: newEvent.category
      };

      if (isEditing) {
        const { error } = await supabase
          .from('events')
          .update(eventToAdd)
          .eq('id', newEvent.id);
        if (error) console.error('Error updating event:', error);
        else {
          setEvents(currentEvents => currentEvents.map(event =>
            event.id === newEvent.id ? { ...event, ...eventToAdd, allDay: !eventToAdd.start_time.includes('T') } : event
          ));
        }
      } else {
        const { data, error } = await supabase
          .from('events')
          .insert([eventToAdd])
          .select();
        if (error) console.error('Error adding event:', error);
        else {
          const newFormattedEvent = {
            id: data[0].id,
            title: data[0].title,
            start: data[0].start_time,
            end: data[0].end_time,
            allDay: !data[0].start_time.includes('T'), // Determine if it's an all-day event
            extendedProps: {
              description: data[0].description,
              location: data[0].location,
              category: data[0].category
            }
          };
          setEvents(currentEvents => [...currentEvents, newFormattedEvent]);
        }
      }

      setIsModalOpen(false);
      setNewEvent({ title: '', description: '', start: '', end: '', location: '', category: '' });
    }
  };

  const handleEventDelete = async () => {
    if (isEditing && newEvent.id) {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', newEvent.id);
      if (error) console.error('Error deleting event:', error);
      else {
        setIsModalOpen(false);
        setEvents(currentEvents => currentEvents.filter(event => event.id !== newEvent.id));
      }
    }
  };

  const handleEventDrop = async (dropInfo) => {
    console.log('handleEventDrop:', dropInfo);
    const updatedEvent = {
      id: dropInfo.event.id,
      start_time: dropInfo.event.startStr,
      end_time: dropInfo.event.endStr || dropInfo.event.startStr // Use start time if end time is empty
    };

    if (!updatedEvent.start_time) {
      console.error('Invalid event start time:', updatedEvent);
      return;
    }

    const { error } = await supabase
      .from('events')
      .update(updatedEvent)
      .eq('id', updatedEvent.id);

    if (error) {
      console.error('Error updating event:', error);
    } else {
      setEvents(currentEvents => currentEvents.map(event =>
        event.id === updatedEvent.id 
          ? { 
              ...event, 
              start: updatedEvent.start_time, 
              end: updatedEvent.end_time,
              allDay: !updatedEvent.start_time.includes('T'), // Determine if it's an all-day event
              extendedProps: {
                ...event.extendedProps,
                start_time: updatedEvent.start_time,
                end_time: updatedEvent.end_time
              }
            }
          : event
      ));
    }
  };

  const handleEventResize = async (resizeInfo) => {
    console.log('handleEventResize:', resizeInfo);
    const updatedEvent = {
      id: resizeInfo.event.id,
      start_time: resizeInfo.event.startStr,
      end_time: resizeInfo.event.endStr || resizeInfo.event.startStr // Use start time if end time is empty
    };

    if (!updatedEvent.start_time) {
      console.error('Invalid event start time:', updatedEvent);
      return;
    }

    const { error } = await supabase
      .from('events')
      .update(updatedEvent)
      .eq('id', updatedEvent.id);

    if (error) {
      console.error('Error updating event:', error);
    } else {
      setEvents(currentEvents => currentEvents.map(event =>
        event.id === updatedEvent.id 
          ? { 
              ...event, 
              start: updatedEvent.start_time, 
              end: updatedEvent.end_time,
              allDay: !updatedEvent.start_time.includes('T'), // Determine if it's an all-day event
              extendedProps: {
                ...event.extendedProps,
                start_time: updatedEvent.start_time,
                end_time: updatedEvent.end_time
              }
            }
          : event
      ));
    }
  };

  const handleEventChange = async (changeInfo) => {
    console.log('handleEventChange:', changeInfo);
    const updatedEvent = {
      id: changeInfo.event.id,
      start_time: changeInfo.event.startStr,
      end_time: changeInfo.event.endStr || changeInfo.event.startStr // Use start time if end time is empty
    };

    if (!updatedEvent.start_time) {
      console.error('Invalid event start time:', updatedEvent);
      return;
    }

    const { error } = await supabase
      .from('events')
      .update(updatedEvent)
      .eq('id', updatedEvent.id);

    if (error) {
      console.error('Error updating event:', error);
    } else {
      setEvents(currentEvents => currentEvents.map(event =>
        event.id === updatedEvent.id 
          ? { 
              ...event, 
              start: updatedEvent.start_time, 
              end: updatedEvent.end_time,
              allDay: !updatedEvent.start_time.includes('T'), // Determine if it's an all-day event
              extendedProps: {
                ...event.extendedProps,
                start_time: updatedEvent.start_time,
                end_time: updatedEvent.end_time
              }
            }
          : event
      ));
    }
  };

  const handleSearch = async () => {
    let query = supabase
      .from('events')
      .select('*');

    if (searchTerm) {
      query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }

    if (filterCategory) {
      query = query.eq('category', filterCategory);
    }

    const { data, error } = await query;

    if (error) console.error('Error searching events:', error);
    else {
      const formattedEvents = data.map(event => ({
        id: event.id,
        title: event.title,
        start: event.start_time,
        end: event.end_time,
        allDay: !event.start_time.includes('T'), // Determine if it's an all-day event
        extendedProps: {
          description: event.description,
          location: event.location,
          category: event.category
        }
      }));
      setEvents(formattedEvents);
    }
  };

  return (
    <div className="p-4 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Calendar</h2>
      <div className="mb-4 flex space-x-2">
        <Input
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleSearch}>Search</Button>
      </div>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listYear'
        }}
        events={events.map(event => ({
          ...event,
          end: event.end || event.start, // Ensure all events have an end time
          allDay: !event.start.includes('T') // Ensure all-day property is set correctly
        }))}
        selectable={true}
        select={handleDateSelect}
        eventClick={handleEventClick}
        editable={true}
        eventDrop={handleEventDrop}
        eventResize={handleEventResize}
        eventChange={handleEventChange}
        eventResizableFromStart={true}
        height="auto"
        timeZone="Asia/Kolkata"
      />
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Event' : 'Add New Event'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={newEvent.category}
                onValueChange={(value) => setNewEvent({ ...newEvent, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            {isEditing && (
              <Button variant="destructive" onClick={handleEventDelete}>Delete</Button>
            )}
            <Button onClick={handleEventAdd}>{isEditing ? 'Update' : 'Add'} Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarSection;
