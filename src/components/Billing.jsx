import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import PrintUI from "./PrintUI";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { supabase } from "../supabase";
import { v4 as uuidv4 } from "uuid";  // Import the UUID generator

const Billing = () => {
  const [items, setItems] = useState([{ description: "", total: "" }]);
  const [billHistory, setBillHistory] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);

  const generateInvoiceNumber = () => {
    return `INV-${uuidv4().split('-')[0]}`;
  };

  const addItem = () => {
    setItems([...items, { description: "", total: "" }]);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
  };

  const handleBillGenerated = async () => {
    const newBill = {
      id: uuidv4(),  // Generate a valid UUID
      invoice_number: generateInvoiceNumber(),
      date: new Date().toLocaleDateString(),
      total: calculateTotal().toFixed(2),
      items: [...items],
    };

    const { data, error } = await supabase
      .from('bills')
      .insert([newBill]);

    if (error) {
      console.error('Error saving bill:', error);
    } else {
      setBillHistory([data[0], ...billHistory]);
      setItems([{ description: "", total: "" }]);
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
                    <Label htmlFor={`total-${index}`}>Total</Label>
                    <Input
                      id={`total-${index}`}
                      type="number"
                      value={item.total}
                      onChange={(e) =>
                        updateItem(index, "total", e.target.value)
                      }
                    />
                  </div>
                </div>
              ))}
              <Button onClick={addItem} variant="outline" className="mt-2">
                Add Item
              </Button>
              <div className="mt-4">
                <p className="text-right font-bold">
                  Total: ₹{calculateTotal().toFixed(2)}
                </p>
              </div>
              <PrintUI
                items={items}
                calculateTotal={calculateTotal}
                onBillGenerated={handleBillGenerated}
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
                            <span className="font-medium text-sm"> {bill.invoice_number}</span>
                            <span className="font-medium text-sm"> {bill.date}</span>
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
                              <span>₹{item.total}</span>
                            </div>
                          ))}
                          <div className="text-right font-bold mt-4">
                            Total: ₹{bill.total}
                          </div>
                        </div>
                        <Separator className="my-4" />
                        <PrintUI
                          items={bill.items}
                          calculateTotal={() => parseFloat(bill.total)}
                          invoiceNumber={bill.invoice_number}
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
