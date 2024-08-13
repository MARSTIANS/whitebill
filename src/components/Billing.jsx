import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import PrintUI from "./PrintUI";

const Billing = () => {
  const [items, setItems] = useState([{ description: "", total: "" }]);
  const [billHistory, setBillHistory] = useState([]);

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

  const handleBillGenerated = () => {
    const newBill = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      total: calculateTotal().toFixed(2),
      items: [...items],
    };
    setBillHistory([newBill, ...billHistory]);
    setItems([{ description: "", total: "" }]);
  };

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
                  Total: ${calculateTotal().toFixed(2)}
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
          <Card className="w-full bg-gray-50 p-4">
            <CardHeader>
              <CardTitle>Bill History</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                {billHistory.map((bill) => (
                  <div key={bill.id} className="mb-4 p-4 border rounded">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold">Date: {bill.date}</span>
                      <span className="font-bold">Total: ${bill.total}</span>
                    </div>
                    {bill.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.description}</span>
                        <span>${item.total}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Billing;
