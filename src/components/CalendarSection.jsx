import React, { useState, useEffect, useRef, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "../supabase";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import NotificationDropdown from "./NotificationDropdown";

const CATEGORIES = [
  { value: "shoot", label: "Shoot" },
  { value: "meeting", label: "Meeting" },
  { value: "post", label: "Post" },
];

const FILTER_CATEGORIES = [{ value: "all", label: "All" }, ...CATEGORIES];

const getCategoryColor = (category, isDone) => {
  if (isDone) return "#4caf50";
  switch (category) {
    case "shoot":
      return "#f06543";
    case "meeting":
      return "#0582ca";
    case "post":
      return "#f48c06";
    default:
      return "#6c757d";
  }
};

const CalendarSection = () => {
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    start: "",
    end: "",
    location: "",
    category: "",
    allDay: false,
    isDone: false,
    clientName: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterClientName, setFilterClientName] = useState("");
  const [printClientName, setPrintClientName] = useState("");
  const [isPrinting, setIsPrinting] = useState(false);
  const [errors, setErrors] = useState({ title: "", category: "" });
  const [clients, setClients] = useState([]);
  const [openClientCombobox, setOpenClientCombobox] = useState(false);
  const calendarComponentRef = useRef(null);
  const calendarRef = useRef(null);

  const fetchClients = async () => {
    const { data, error } = await supabase
      .from("clients")
      .select("client_name")
      .order("client_name");
    if (error) {
      console.error("Error fetching clients:", error);
    } else {
      setClients(
        data.map((client) => ({
          value: client.client_name,
          label: client.client_name,
        }))
      );
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.updateSize();
    }
  }, [events, filterCategory, filterClientName]);

  const fetchEvents = useCallback(async () => {
    let query = supabase.from("events").select("*");

    if (searchTerm) {
      query = query.or(
        `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,client_name.ilike.%${searchTerm}%`
      );
    }

    if (filterCategory && filterCategory !== "all") {
      query = query.eq("category", filterCategory);
    }

    if (filterClientName) {
      query = query.eq("client_name", filterClientName);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching events:", error);
    } else {
      const formattedEvents = data.map((event) => ({
        id: event.id,
        title: event.title,
        start: event.start_time,
        end: event.end_time,
        allDay: event.all_day,
        backgroundColor: getCategoryColor(event.category, event.is_done),
        borderColor: getCategoryColor(event.category, event.is_done),
        extendedProps: {
          description: event.description,
          location: event.location,
          category: event.category,
          isDone: event.is_done,
          clientName: event.client_name,
        },
      }));
      setEvents(formattedEvents);
    }
  }, [searchTerm, filterCategory, filterClientName]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleDateSelect = (selectInfo) => {
    setIsModalOpen(true);
    setNewEvent({
      title: "",
      description: "",
      start: selectInfo.startStr,
      end: selectInfo.endStr || selectInfo.startStr,
      location: "",
      category: "",
      allDay: selectInfo.allDay,
      isDone: false,
      clientName: "",
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
      end: clickInfo.event.endStr || clickInfo.event.startStr,
      location: clickInfo.event.extendedProps.location,
      category: clickInfo.event.extendedProps.category,
      allDay: clickInfo.event.allDay,
      isDone: clickInfo.event.extendedProps.isDone,
      clientName: clickInfo.event.extendedProps.clientName,
    });
    setIsEditing(true);
  };

  const validateEvent = () => {
    let isValid = true;
    const newErrors = { title: "", category: "" };

    if (!newEvent.title) {
      newErrors.title = "Event title is required.";
      isValid = false;
    }

    if (!newEvent.category) {
      newErrors.category = "Event category is required.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleEventAdd = async () => {
    if (validateEvent()) {
      const eventToAdd = {
        title: newEvent.title,
        description: newEvent.description,
        start_time: newEvent.allDay
          ? `${newEvent.start}T00:00:00Z`
          : newEvent.start,
        end_time: newEvent.allDay ? `${newEvent.end}T23:59:59Z` : newEvent.end,
        location: newEvent.location,
        category: newEvent.category,
        all_day: newEvent.allDay,
        is_done: newEvent.isDone,
        client_name: newEvent.clientName,
      };

      if (isEditing) {
        const { error } = await supabase
          .from("events")
          .update(eventToAdd)
          .eq("id", newEvent.id);
        if (error) console.error("Error updating event:", error);
        else {
          setEvents((currentEvents) =>
            currentEvents.map((event) =>
              event.id === newEvent.id
                ? {
                    ...event,
                    ...eventToAdd,
                    allDay: newEvent.allDay,
                    backgroundColor: getCategoryColor(
                      newEvent.category,
                      newEvent.isDone
                    ),
                    borderColor: getCategoryColor(
                      newEvent.category,
                      newEvent.isDone
                    ),
                    extendedProps: {
                      ...event.extendedProps,
                      ...eventToAdd,
                      isDone: newEvent.isDone,
                      clientName: newEvent.clientName,
                    },
                  }
                : event
            )
          );
        }
      } else {
        const { data, error } = await supabase
          .from("events")
          .insert([eventToAdd])
          .select();
        if (error) console.error("Error adding event:", error);
        else {
          const newFormattedEvent = {
            id: data[0].id,
            title: data[0].title,
            start: data[0].start_time,
            end: data[0].end_time,
            allDay: data[0].all_day,
            backgroundColor: getCategoryColor(
              data[0].category,
              data[0].is_done
            ),
            borderColor: getCategoryColor(data[0].category, data[0].is_done),
            extendedProps: {
              description: data[0].description,
              location: data[0].location,
              category: data[0].category,
              isDone: data[0].is_done,
              clientName: data[0].client_name,
            },
          };
          setEvents((currentEvents) => [...currentEvents, newFormattedEvent]);
        }
      }

      setIsModalOpen(false);
      setNewEvent({
        title: "",
        description: "",
        start: "",
        end: "",
        location: "",
        category: "",
        allDay: false,
        isDone: false,
        clientName: "",
      });
    }
  };

  const handleEventDelete = async () => {
    if (isEditing && newEvent.id) {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", newEvent.id);
      if (error) console.error("Error deleting event:", error);
      else {
        setIsModalOpen(false);
        setEvents((currentEvents) =>
          currentEvents.filter((event) => event.id !== newEvent.id)
        );
      }
    }
  };

  const handleEventDrop = async (dropInfo) => {
    const updatedEvent = {
      id: dropInfo.event.id,
      start_time: dropInfo.event.allDay
        ? `${dropInfo.event.startStr}T00:00:00Z`
        : dropInfo.event.startStr,
      end_time: dropInfo.event.allDay
        ? `${dropInfo.event.endStr || dropInfo.event.startStr}T23:59:59Z`
        : dropInfo.event.endStr || dropInfo.event.startStr,
      all_day: dropInfo.event.allDay,
    };

    const { error } = await supabase
      .from("events")
      .update(updatedEvent)
      .eq("id", updatedEvent.id);

    if (error) {
      console.error("Error updating event:", error);
    } else {
      setEvents((currentEvents) =>
        currentEvents.map((event) =>
          event.id === updatedEvent.id
            ? {
                ...event,
                start: updatedEvent.start_time,
                end: updatedEvent.end_time,
                allDay: updatedEvent.all_day,
                backgroundColor: getCategoryColor(
                  event.extendedProps.category,
                  event.extendedProps.isDone
                ),
                borderColor: getCategoryColor(
                  event.extendedProps.category,
                  event.extendedProps.isDone
                ),
                extendedProps: {
                  ...event.extendedProps,
                  start_time: updatedEvent.start_time,
                  end_time: updatedEvent.end_time,
                },
              }
            : event
        )
      );
    }
  };

  const handleEventResize = async (resizeInfo) => {
    const updatedEvent = {
      id: resizeInfo.event.id,
      start_time: resizeInfo.event.allDay
        ? `${resizeInfo.event.startStr}T00:00:00Z`
        : resizeInfo.event.startStr,
      end_time: resizeInfo.event.allDay
        ? `${resizeInfo.event.endStr || resizeInfo.event.startStr}T23:59:59Z`
        : resizeInfo.event.endStr || resizeInfo.event.startStr,
      all_day: resizeInfo.event.allDay,
    };

    const { error } = await supabase
      .from("events")
      .update(updatedEvent)
      .eq("id", updatedEvent.id);

    if (error) {
      console.error("Error updating event:", error);
    } else {
      setEvents((currentEvents) =>
        currentEvents.map((event) =>
          event.id === updatedEvent.id
            ? {
                ...event,
                start: updatedEvent.start_time,
                end: updatedEvent.end_time,
                allDay: updatedEvent.all_day,
                backgroundColor: getCategoryColor(
                  event.extendedProps.category,
                  event.extendedProps.isDone
                ),
                borderColor: getCategoryColor(
                  event.extendedProps.category,
                  event.extendedProps.isDone
                ),
                extendedProps: {
                  ...event.extendedProps,
                  start_time: updatedEvent.start_time,
                  end_time: updatedEvent.end_time,
                },
              }
            : event
        )
      );
    }
  };

  const handleEventChange = async (changeInfo) => {
    const updatedEvent = {
      id: changeInfo.event.id,
      start_time: changeInfo.event.allDay
        ? `${changeInfo.event.startStr}T00:00:00Z`
        : changeInfo.event.startStr,
      end_time: changeInfo.event.allDay
        ? `${changeInfo.event.endStr || changeInfo.event.startStr}T23:59:59Z`
        : changeInfo.event.endStr || changeInfo.event.startStr,
      all_day: changeInfo.event.allDay,
      category: changeInfo.event.extendedProps.category,
      is_done: changeInfo.event.extendedProps.isDone,
      client_name: changeInfo.event.extendedProps.clientName,
    };

    const { error } = await supabase
      .from("events")
      .update(updatedEvent)
      .eq("id", updatedEvent.id);

    if (error) {
      console.error("Error updating event:", error);
    } else {
      setEvents((currentEvents) =>
        currentEvents.map((event) =>
          event.id === updatedEvent.id
            ? {
                ...event,
                start: updatedEvent.start_time,
                end: updatedEvent.end_time,
                allDay: updatedEvent.all_day,
                backgroundColor: getCategoryColor(
                  updatedEvent.category,
                  updatedEvent.is_done
                ),
                borderColor: getCategoryColor(
                  updatedEvent.category,
                  updatedEvent.is_done
                ),
                extendedProps: {
                  ...event.extendedProps,
                  start_time: updatedEvent.start_time,
                  end_time: updatedEvent.end_time,
                  category: updatedEvent.category,
                  isDone: updatedEvent.is_done,
                  clientName: updatedEvent.client_name,
                },
              }
            : event
        )
      );
    }
  };

  const handleSearch = useCallback(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handlePrint = useReactToPrint({
    content: () => calendarComponentRef.current,
    copyStyles: true,
    pageStyle: `
      @media print {
        body { 
          -webkit-print-color-adjust: exact; 
          print-color-adjust: exact;
        }
        .fc-toolbar, .fc-header-toolbar { display: none !important; }
        .fc-view-harness { height: auto !important; }
        .fc { 
          max-width: 1160px !important; 
          margin: 0 !important;
          padding: 0 !important;
        }
        .fc-view { 
          width: 1160px !important; 
          table-layout: fixed !important;
        }
        .fc-scroller { 
          overflow: visible !important; 
          height: auto !important; 
        }
        .fc-day-grid-container { height: auto !important; }
        .print-header { 
          display: block !important; 
          text-align: center; 
          font-size: 24px; 
          font-weight: bold; 
          margin-bottom: 20px; 
        }
        .fc th, .fc td { 
          border: 1px solid #000 !important;
        }
        .fc-day-grid .fc-row {
          min-height: 5em !important;
        }
        .fc-col-header-cell {
          width: 14.28% !important;
        }
        @page { 
          size: landscape;
          margin: 0.5cm;
        }
      }
    `,
    onBeforeGetContent: () => {
      return new Promise((resolve) => {
        setPrintClientName(filterClientName);
        if (calendarRef.current) {
          const calendarApi = calendarRef.current.getApi();
          calendarApi.changeView("dayGridMonth");
          calendarApi.updateSize();
          calendarApi.render();
        }
        setTimeout(resolve, 250);
      });
    },
    onAfterPrint: () => {
      setIsPrinting(false);
      if (calendarRef.current) {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.updateSize();
      }
    },
  });

  const triggerPrint = useCallback(() => {
    setIsPrinting(true);
    setTimeout(() => {
      handlePrint();
    }, 100);
  }, [handlePrint]);

  useEffect(() => {
    if (isPrinting) {
      handlePrint();
    }
  }, [isPrinting, handlePrint]);

  return (
    <div>
       <div className="flex justify-between items-center ">
        <h2 className="text-2xl font-bold mb-4">Event Calendar</h2>
        <NotificationDropdown />
      </div>
      <Card className="bg-gray-50 p-4">
        <div className="mb-4 flex space-x-2">
          <Input
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyUp={handleSearch}
          />
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              {FILTER_CATEGORIES.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Popover
            open={openClientCombobox}
            onOpenChange={setOpenClientCombobox}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openClientCombobox}
                className="w-full justify-between"
              >
                {filterClientName || "Filter by Client"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[390px] p-0">
              <Command>
                <CommandInput placeholder="Search clients..." />
                <CommandList>
                  <CommandEmpty>No client found.</CommandEmpty>
                  <CommandGroup>
                    {clients.map((client) => (
                      <CommandItem
                        key={client.value}
                        value={client.value}
                        onSelect={(currentValue) => {
                          setFilterClientName(
                            currentValue === filterClientName
                              ? ""
                              : currentValue
                          );
                          setOpenClientCombobox(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            filterClientName === client.value
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {client.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <Button onClick={triggerPrint}>Print Calendar</Button>
        </div>
        <div className="bg-white shadow-none" ref={calendarComponentRef}>
          <div className="print-header" style={{ display: "none" }}>
            Monthly Chart {printClientName ? `- ${printClientName}` : ""}
          </div>
          <FullCalendar
          ref={calendarRef}
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            listPlugin,
            interactionPlugin,
          ]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay,listYear",
          }}
          events={events}
          selectable={true}
          select={handleDateSelect}
          eventClick={handleEventClick}
          editable={true}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          eventChange={handleEventChange}
          eventResizableFromStart={true}
          aspectRatio={1.5} // Increased from 1.35 to ensure all columns fit
          contentHeight="auto" // Added to control the calendar's height
          timeZone="Asia/Kolkata"
          handleWindowResize={true}
          stickyHeaderDates={true}
          dayMaxEvents={2}
          moreLinkClick="popover"
          eventTimeFormat={{
            hour: "numeric",
            minute: "2-digit",
            meridiem: "short",
          }}
          dayCellClassNames="border-2 border-gray-300"
          eventClassNames="mb-1 font-semibold"
          dayHeaderClassNames="bg-gray-200 text-gray-700 uppercase tracking-wider"
        />
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Edit Event" : "Add New Event"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  value={newEvent.title}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, title: e.target.value })
                  }
                />
                {errors.title && <p className="text-red-500">{errors.title}</p>}
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newEvent.description}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, description: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={newEvent.location}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, location: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newEvent.category}
                  onValueChange={(value) =>
                    setNewEvent({ ...newEvent, category: value })
                  }
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
                {errors.category && (
                  <p className="text-red-500">{errors.category}</p>
                )}
              </div>
              <div>
                <Label htmlFor="clientName">Client Name</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openClientCombobox}
                      className="w-full justify-between"
                    >
                      {newEvent.clientName || "Select a client"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[460px] p-0">
                    <Command>
                      <CommandInput placeholder="Search clients..." />
                      <CommandList>
                        <CommandEmpty>No client found.</CommandEmpty>
                        <CommandGroup>
                          {clients.map((client) => (
                            <CommandItem
                              key={client.value}
                              value={client.value}
                              onSelect={(currentValue) => {
                                setNewEvent({
                                  ...newEvent,
                                  clientName: currentValue,
                                });
                                setOpenClientCombobox(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  newEvent.clientName === client.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {client.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isDone"
                  checked={newEvent.isDone}
                  onCheckedChange={(checked) =>
                    setNewEvent({ ...newEvent, isDone: checked })
                  }
                />
                <Label htmlFor="isDone">Mark as Done</Label>
              </div>
            </div>
            <DialogFooter>
              {isEditing && (
                <Button variant="destructive" onClick={handleEventDelete}>
                  Delete
                </Button>
              )}
              <Button onClick={handleEventAdd}>
                {isEditing ? "Update" : "Add"} Event
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  );
};

export default CalendarSection;