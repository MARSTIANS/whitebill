import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import PrintUI from "./PrintUI";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "../supabase";
import { v4 as uuidv4 } from "uuid";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Search, Trash2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import NotificationDropdown from "./NotificationDropdown";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Billing = () => {
  const [items, setItems] = useState([
    { description: "Reels", quantity: "", numberOfDays: "", total: "" },
    { description: "Posters", quantity: "", numberOfDays: "", total: "" },
    { description: "Total Engagements", quantity: "", numberOfDays: "", total: "" },
    { description: "Story", quantity: "", numberOfDays: "", total: "" }
  ]);
  const [billHistory, setBillHistory] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [clientDetails, setClientDetails] = useState("");
  const [manualTotal, setManualTotal] = useState(0);
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [searchTerm, setSearchTerm] = useState("");
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isComboBoxOpen, setIsComboBoxOpen] = useState(false);

  const generateUniqueInvoiceNumber = async () => {
    let invoiceNumber;
    let exists = true;

    while (exists) {
      invoiceNumber = `INV-${uuidv4().split('-')[0]}`;
      const { data } = await supabase
        .from('bills')
        .select('invoice_number')
        .eq('invoice_number', invoiceNumber);

      if (data.length === 0) {
        exists = false;
      }
    }

    return invoiceNumber;
  };

  const fetchClients = async () => {
    const { data, error } = await supabase.from('clients').select('*');
    if (error) {
      console.error('Error fetching clients:', error);
    } else {
      setClients(data);
    }
  };

  useEffect(() => {
    fetchClients();
    fetchBillHistory();
  }, []);

  const addItem = () => {
    setItems([...items, { description: "", quantity: "", numberOfDays: "", total: "" }]);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleBillGenerated = async () => {
    const formattedDate = dateRange.from && dateRange.to 
      ? `${format(new Date(dateRange.from), "dd/MM/yyyy")} to ${format(new Date(dateRange.to), "dd/MM/yyyy")}` 
      : format(new Date(), "dd/MM/yyyy");

    const newBill = {
      id: uuidv4(),
      date: formattedDate,
      total: parseFloat(manualTotal) || 0,
      items: [...items],
      client_details: clientDetails,
    };

    try {
      const { data, error } = await supabase
        .from('bills')
        .insert([newBill]);

      if (error || !data || !data[0]) {
        console.error('Error saving bill:', error);
        throw new Error('Bill creation failed');
      }

      setBillHistory([data[0], ...billHistory]);
      setItems([
        { description: "Reels", quantity: "", numberOfDays: "", total: "" },
        { description: "Posters", quantity: "", numberOfDays: "", total: "" },
        { description: "Total Engagements", quantity: "", numberOfDays: "", total: "" },
        { description: "Story", quantity: "", numberOfDays: "", total: "" }
      ]);
      setClientDetails("");  
      setManualTotal(0);

      return newBill;
    } catch (error) {
      console.error('Error during bill generation:', error);
      return null;
    }
  };

  const fetchBillHistory = async () => {
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching bills:', error);
    } else {
      setBillHistory(data);
    }
  };

  const handleClientSelect = (client) => {
    setSelectedClient(client);
    setClientDetails(`${client.company}\n${client.location}\n${client.phone}`);
    setIsComboBoxOpen(false);
  };

  const handleDeleteBill = async (id) => {
    try {
      const { error } = await supabase
        .from('bills')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error('Error deleting bill');
      }

      setBillHistory(billHistory.filter(bill => bill.id !== id));
    } catch (error) {
      console.error('Error deleting bill:', error);
    }
  };

  const filteredBillHistory = billHistory.filter(bill =>
    bill.client_details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="">
      <div className="flex justify-between items-center ">
        <h2 className="text-2xl font-bold mb-4">Billing</h2>
        <NotificationDropdown />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gray-50 shadow-none rounded-lg overflow-hidden">
          <CardHeader className=" text-black">
            <CardTitle className="text-2xl">Enter Bill Details</CardTitle>
          </CardHeader>
          <CardContent className="px-6">
            <div className="mb-6">
              <Label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 mb-2">Select Date Range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="dateRange"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange && "text-gray-500"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "dd/MM/yyyy")} -{" "}
                          {format(dateRange.to, "dd/MM/yyyy")}
                        </>
                      ) : (
                        format(dateRange.from, "dd/MM/yyyy")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="mb-6">
              <Label htmlFor="client-select" className="block text-sm font-medium text-gray-700 mb-2">Select Client</Label>
              <Popover open={isComboBoxOpen} onOpenChange={setIsComboBoxOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="client-select"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedClient && "text-gray-500"
                    )}
                  >
                    {selectedClient ? selectedClient.client_name : "Select a client"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search clients..." />
                    <CommandList>
                      <CommandEmpty>No clients found.</CommandEmpty>
                      <CommandGroup>
                        {clients.map((client) => (
                          <CommandItem
                            key={client.id}
                            value={client.client_name}
                            onSelect={() => handleClientSelect(client)}
                          >
                            <span>{client.client_name}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="mb-6">
              <Label htmlFor="client-details" className="block text-sm font-medium text-gray-700 mb-2">Client Details</Label>
              <Textarea
                id="client-details"
                placeholder="Enter client details here"
                value={clientDetails}
                onChange={(e) => setClientDetails(e.target.value)}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {items.map((item, index) => (
              <div key={index} className="flex flex-wrap -mx-2 mb-4">
                <div className="w-full md:w-1/2 px-2 mb-4 md:mb-0">
                  <Label htmlFor={`description-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Description</Label>
                  <Input
                    id={`description-${index}`}
                    value={item.description}
                    onChange={(e) => updateItem(index, "description", e.target.value)}
                    placeholder="Enter item description"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="w-full md:w-1/4 px-2 mb-4 md:mb-0">
                  <Label htmlFor={`quantity-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Quantity</Label>
                  <Input
                    type="number"
                    id={`quantity-${index}`}
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", e.target.value)}
                    placeholder="Qty"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="w-full md:w-1/4 px-2">
                  <Label htmlFor={`numberOfDays-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Number of Days</Label>
                  <Input
                    type="number"
                    id={`numberOfDays-${index}`}
                    value={item.numberOfDays}
                    onChange={(e) => updateItem(index, "numberOfDays", e.target.value)}
                    placeholder="Days"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            ))}

            <Button onClick={addItem} variant="outline" className="mt-4 mb-6 w-full">
              Add Item
            </Button>

            <div className="mb-6">
              <Label htmlFor="manual-total" className="block text-sm font-medium text-gray-700 mb-2">Total</Label>
              <Input
                id="manual-total"
                type="number"
                value={manualTotal}
                onChange={(e) => setManualTotal(e.target.value)}
                className="w-full p-3 text-right font-bold border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <PrintUI
              items={items}
              total={manualTotal}
              onBillGenerated={handleBillGenerated}
              date={dateRange.from && dateRange.to 
                ? `${format(new Date(dateRange.from), "dd/MM/yyyy")} to ${format(new Date(dateRange.to), "dd/MM/yyyy")}` 
                : format(new Date(), "dd/MM/yyyy")}
              clientDetails={clientDetails}
            />
          </CardContent>
        </Card>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="mt-4 w-full">
              View Bill History
            </Button>
          </SheetTrigger>
          <SheetContent className="overflow-auto bg-white">
            <SheetHeader>
              <SheetTitle>Bill History</SheetTitle>
            </SheetHeader>
            <div className="mt-4 px-4">
              <Input
                id="search"
                type="text"
                placeholder="Search by client details..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-4"
              />
              <ScrollArea className="h-[510px] bg-white w-full rounded-md border p-4">
                {filteredBillHistory.map((bill) => (
                  <React.Fragment key={bill.id}>
                    <Dialog>
                      <DialogTrigger asChild>
                        <div className="mb-3 p-1 rounded-md cursor-pointer hover:bg-gray-100 transition duration-300 relative group">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-sm text-gray-800">{bill.date}</span>
                          </div>
                          <div className="text-sm text-gray-500 mt-1 truncate">{bill.client_details}</div>
                          <Trash2
                            className="absolute top-4 right-2 text-red-500 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            onClick={() => handleDeleteBill(bill.id)}
                          />
                        </div>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle className="text-lg font-semibold text-gray-900">Bill Details</DialogTitle>
                        </DialogHeader>
                        <Separator className="my-4" />
                        <div className="mt-4">
                          <div className="text-sm font-medium text-gray-500 mb-2">Date: {bill.date}</div>
                          {bill.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm mb-2">
                              <span className="text-gray-800">{item.description}</span>
                              <span className="text-gray-600">Qty: {item.quantity}, Days: {item.numberOfDays}</span>
                            </div>
                          ))}
                          <div className="text-right font-bold mt-4 text-lg text-blue-600">
                            Total: ₹{bill.total}
                          </div>
                        </div>
                        <Separator className="my-4" />
                        <PrintUI
                          items={bill.items}
                          total={bill.total}
                          onBillGenerated={() => {}} 
                          date={bill.date} 
                          clientDetails={bill.client_details}
                        />
                      </DialogContent>
                    </Dialog>
                    <Separator className="my-2" />
                  </React.Fragment>
                ))}
              </ScrollArea>
            </div>
        
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default Billing;
