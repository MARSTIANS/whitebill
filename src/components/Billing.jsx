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
import { Calendar as CalendarIcon } from "lucide-react";
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

  return (
    <div className="">
      <h2 className="text-2xl font-bold mb-4">Billing</h2>
      <div className="flex space-x-6">
        <div className="w-1/2">
          <Card className="w-full bg-gray-50 p-4">
            <CardHeader>
              <CardTitle>Enter Bill Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 ">
                <Label>Select Date Range</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="dateRange"
                      variant={"outline"}
                      className={cn(
                        "w-full lg:w-[300px] justify-start text-left font-normal",
                        !dateRange && "text-muted-foreground"
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

              <div className="mb-4">
                <Label htmlFor="client-details">Client Details</Label>
                <Textarea
                  id="client-details"
                  placeholder="Enter client details here"
                  value={clientDetails}
                  onChange={(e) => setClientDetails(e.target.value)}
                  rows={4}
                />
              </div>

              {items.map((item, index) => (
                <div key={index} className="flex space-x-4 mb-4">
                  <div className="flex-1">
                    <Label htmlFor={`description-${index}`}>Description</Label>
                    <Input
                      id={`description-${index}`}
                      value={item.description}
                      onChange={(e) =>
                        updateItem(index, "description", e.target.value)
                      }
                    />
                  </div>
                  <div className="w-1/4">
                    <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                    <Input
                    type="number"
                      id={`quantity-${index}`}
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(index, "quantity", e.target.value)
                      }
                    />
                  </div>
                  <div className="w-1/4">
                    <Label htmlFor={`numberOfDays-${index}`}>Number of Days</Label>
                    <Input
                    type="number"
                      id={`numberOfDays-${index}`}
                      value={item.numberOfDays}
                      onChange={(e) =>
                        updateItem(index, "numberOfDays", e.target.value)
                      }
                    />
                  </div>
                </div>
              ))}
              <Button onClick={addItem} variant="outline" className="mt-2">
                Add Item
              </Button>

              <div className="mt-4">
                <Label htmlFor="manual-total">Total</Label>
                <Input
                  id="manual-total"
                  type="number"
                  value={manualTotal}
                  onChange={(e) => setManualTotal(e.target.value)}
                  className="text-right font-bold"
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
        </div>
        <div className="w-1/2">
          <Card className="w-full bg-gray-50 p-2">
            <CardHeader>
              <CardTitle>Bill History</CardTitle>
            </CardHeader>
            <ScrollArea className="h-72 w-full rounded-md border">
              <div className="p-4">
                {billHistory.map((bill) => (
                  <React.Fragment key={bill.id}>
                    <Dialog>
                      <DialogTrigger asChild>
                        <div className="mb-2 cursor-pointer">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-sm">{bill.invoice_number}</span>
                            <span className="font-medium text-sm">{bill.date}</span>
                          </div>
                        </div>
                      </DialogTrigger>
                      <Separator className="my-2" />
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Bill Details</DialogTitle>
                        </DialogHeader>
                        <Separator />
                        <div className="mt-4">
                          {bill.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm mb-2">
                              <span>{item.description}</span>
                              <span>{item.quantity}</span>
                              <span>{item.numberOfDays}</span>
                            </div>
                          ))}
                          <div className="text-right font-bold mt-4">
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
                  </React.Fragment>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Billing;
