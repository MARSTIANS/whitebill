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
import { Calendar as CalendarIcon, Search } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const Billing = () => {
  const [items, setItems] = useState([{ description: "", quantity: "", numberOfDays: "", total: "" }]);
  const [billHistory, setBillHistory] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [clientDetails, setClientDetails] = useState("");
  const [manualTotal, setManualTotal] = useState(0);
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [searchTerm, setSearchTerm] = useState("");

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

  const addItem = () => {
    setItems([...items, { description: "", quantity: "", numberOfDays: "", total: "" }]);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleBillGenerated = async () => {
    const invoiceNumber = await generateUniqueInvoiceNumber();  // Generate a unique invoice number
    const newBill = {
      id: uuidv4(),
      invoice_number: invoiceNumber,
      date: dateRange.from && dateRange.to 
            ? `${new Date(dateRange.from).toLocaleDateString()} to ${new Date(dateRange.to).toLocaleDateString()}` 
            : new Date().toLocaleDateString(),
      total: parseFloat(manualTotal) || 0,
      items: [...items],
      client_details: clientDetails,
    };

    const { data, error } = await supabase
      .from('bills')
      .insert([newBill]);

    if (error) {
      console.error('Error saving bill:', error);
    } else {
      setBillHistory([data[0], ...billHistory]);
      setItems([{ description: "", quantity: "", numberOfDays: "", total: "" }]);
      setClientDetails("");  
      setManualTotal(0);  
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

  useEffect(() => {
    fetchBillHistory();
  }, []);

  const filteredBillHistory = billHistory.filter(bill =>
    bill.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.client_details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4 font-sans">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Billing Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gray-50 shadow-lg rounded-lg overflow-hidden">
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
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
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

            <Button onClick={addItem} variant="outline" className="mt-4 mb-6 w-full  ">
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
              dateRange={dateRange}
              clientDetails={clientDetails}
            />
          </CardContent>
        </Card>

        <Card className="bg-gray-50 shadow-lg rounded-lg overflow-hidden">
          <CardHeader className=" text-black">
            <CardTitle className="text-2xl">Bill History</CardTitle>
          </CardHeader>
          <CardContent className="px-6">
            <div className="mb-4">
              <Label htmlFor="search" className="sr-only">Search Bills</Label>
              <div className="relative">
                <Input
                  id="search"
                  type="text"
                  placeholder="Search by invoice number or client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              </div>
            </div>
            <ScrollArea className="h-[510px] bg-white w-full rounded-md border p-4">
              {filteredBillHistory.map((bill) => (
                <React.Fragment key={bill.id}>
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="mb-3 p-1 rounded-md cursor-pointer hover:bg-gray-100 transition duration-300">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-sm text-gray-800">{bill.invoice_number}</span>
                          <span className="font-medium text-sm text-gray-600">{bill.date}</span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1 truncate">{bill.client_details}</div>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle className="text-lg font-semibold text-gray-900">Bill Details</DialogTitle>
                      </DialogHeader>
                      <Separator className="my-4" />
                      <div className="mt-4">
                        <div className="text-sm font-medium text-gray-500 mb-2">Invoice: {bill.invoice_number}</div>
                        <div className="text-sm font-medium text-gray-500 mb-4">Date: {bill.date}</div>
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
                        invoiceNumber={bill.invoice_number}
                        dateRange={dateRange}
                        clientDetails={bill.client_details}
                      />
                    </DialogContent>
                  </Dialog>
                  <Separator className="my-2" />
                </React.Fragment>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Billing;