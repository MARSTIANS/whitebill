import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, TrendingDown, TrendingUp } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, Tooltip } from "recharts";
import { LabelList, Pie, PieChart } from "recharts";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import dayjs from "dayjs";
import { format } from "date-fns";
import { supabase } from "../supabase";

const TRANSACTION_CATEGORIES = [
  { value: "travel", label: "Travel" },
  { value: "food", label: "Food" },
  { value: "salary", label: "Salary" },
  { value: "utilities", label: "Utilities" },
  { value: "other", label: "Other" },
];

const TRANSACTION_TYPES = [
  { value: "income", label: "Income" },
  { value: "expense", label: "Expense" },
];

const getCategoryColor = (category) => {
  switch (category) {
    case "travel":
      return "var(--color-travel)";
    case "food":
      return "var(--color-food)";
    case "salary":
      return "var(--color-salary)";
    case "utilities":
      return "var(--color-utilities)";
    case "other":
      return "var(--color-other)";
    default:
      return "var(--color-default)";
  }
};

const DatePicker = ({ label, selectedDate, onDateChange }) => (
  <div className="flex flex-col space-y-2">
    <Label>{label}</Label>
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-[280px] justify-start text-left font-normal"
        >
          <Calendar className="mr-2 h-4 w-4" />
          {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar mode="single" selected={selectedDate} onSelect={onDateChange} initialFocus />
      </PopoverContent>
    </Popover>
  </div>
);

const MonthlyExpenses = () => {
  const [transactions, setTransactions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterDateRange, setFilterDateRange] = useState({
    start: null,
    end: null,
  });
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);

  const fetchTransactions = useCallback(async () => {
    let query = supabase.from("transactions").select("*");

    if (searchTerm) {
      query = query.or(
        `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
      );
    }

    if (filterCategory && filterCategory !== "all") {
      query = query.eq("category", filterCategory);
    }

    if (filterType && filterType !== "all") {
      query = query.eq("type", filterType);
    }

    if (filterDateRange.start && filterDateRange.end) {
      query = query
        .gte("date", filterDateRange.start)
        .lte("date", filterDateRange.end);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching transactions:", error);
    } else {
      setTransactions(data);
    }
  }, [searchTerm, filterCategory, filterType, filterDateRange]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleAddEditTransaction = async () => {
    if (
      currentTransaction.title &&
      currentTransaction.category &&
      currentTransaction.type
    ) {
      const transactionData = {
        title: currentTransaction.title,
        description: currentTransaction.description,
        amount: currentTransaction.amount,
        date: currentTransaction.date,
        category: currentTransaction.category,
        type: currentTransaction.type,
      };

      if (currentTransaction.id) {
        const { error } = await supabase
          .from("transactions")
          .update(transactionData)
          .eq("id", currentTransaction.id);
        if (error) {
          console.error("Error updating transaction:", error);
        } else {
          setTransactions((current) =>
            current.map((transaction) =>
              transaction.id === currentTransaction.id
                ? { ...transaction, ...transactionData }
                : transaction
            )
          );
        }
      } else {
        const { data, error } = await supabase
          .from("transactions")
          .insert([transactionData])
          .select();
        if (error) {
          console.error("Error adding transaction:", error);
        } else {
          setTransactions((current) => [...current, ...data]);
        }
      }

      setIsModalOpen(false);
      setCurrentTransaction(null);
    }
  };

  const handleDeleteTransaction = async (id) => {
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (error) {
      console.error("Error deleting transaction:", error);
    } else {
      setTransactions((current) =>
        current.filter((transaction) => transaction.id !== id)
      );
    }
    setIsAlertOpen(false);
    setTransactionToDelete(null);
  };

  const handleSearch = useCallback(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const summary = transactions.reduce(
    (acc, transaction) => {
      if (transaction.type === "income") {
        acc.income += transaction.amount;
      } else {
        acc.expense += Math.abs(transaction.amount);
      }
      acc.balance = acc.income - acc.expense;
      return acc;
    },
    { income: 0, expense: 0, balance: 0 }
  );

  const categoryWiseData = transactions.reduce((acc, transaction) => {
    if (!acc[transaction.category]) {
      acc[transaction.category] = 0;
    }
    acc[transaction.category] += Math.abs(transaction.amount);
    return acc;
  }, {});

  const highestExpenseCategory = Object.keys(categoryWiseData).reduce(
    (a, b) => (categoryWiseData[a] > categoryWiseData[b] ? a : b),
    ""
  );

  const barChartData = transactions.reduce((acc, transaction) => {
    const month = dayjs(transaction.date).format("MMM");
    const incomeOrExpense = transaction.type === "income" ? "income" : "expense";
    const amount = Math.abs(transaction.amount);

    if (!acc[month]) {
      acc[month] = { month, income: 0, expense: 0 };
    }
    acc[month][incomeOrExpense] += amount;

    return acc;
  }, {});

  const barChartArray = Object.values(barChartData);

  const pieChartData = Object.keys(categoryWiseData).map((category) => ({
    category,
    amount: categoryWiseData[category],
    fill: getCategoryColor(category),
  }));

  const chartConfig = {
    amount: {
      label: "Amount",
    },
    travel: {
      label: "Travel",
      color: "hsl(var(--chart-1))",
    },
    food: {
      label: "Food",
      color: "hsl(var(--chart-2))",
    },
    salary: {
      label: "Salary",
      color: "hsl(var(--chart-3))",
    },
    utilities: {
      label: "Utilities",
      color: "hsl(var(--chart-4))",
    },
    other: {
      label: "Other",
      color: "hsl(var(--chart-5))",
    },
  };

  const resetTransaction = () => {
    setCurrentTransaction({
      title: "",
      description: "",
      amount: "",
      date: new Date(),
      category: "",
      type: "",
    });
  };

  return (
    <div className="p-4 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Monthly Expenses & Income</h2>
      <div className="flex justify-between items-center mb-4 space-x-2">
        <Button onClick={() => {
          resetTransaction();
          setIsModalOpen(true);
        }}>
          Add Transaction
        </Button>
        <Input
          placeholder="Search transactions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyUp={handleSearch}
          className="flex-grow"
        />
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {TRANSACTION_CATEGORIES.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger>
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {TRANSACTION_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mb-4 flex space-x-2">
        <DatePicker label="Start Date" selectedDate={filterDateRange.start} onDateChange={(date) => setFilterDateRange((prev) => ({ ...prev, start: date }))} />
        <DatePicker label="End Date" selectedDate={filterDateRange.end} onDateChange={(date) => setFilterDateRange((prev) => ({ ...prev, end: date }))} />
      </div>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Summary Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Card className="flex flex-row items-center p-4 bg-green-100">
              <TrendingUp className="text-green-500 w-8 h-8 mr-4" />
              <div>
                <h4 className="text-lg font-semibold">Total Income</h4>
                <p className="text-xl font-bold">₹{summary.income}</p>
              </div>
            </Card>
            <Card className="flex flex-row items-center p-4 bg-red-100">
              <TrendingDown className="text-red-500 w-8 h-8 mr-4" />
              <div>
                <h4 className="text-lg font-semibold">Total Expense</h4>
                <p className="text-xl font-bold">₹{summary.expense}</p>
              </div>
            </Card>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <Card className="col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>Income vs. Expenses</CardTitle>
            <CardDescription>Comparison of income and expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <BarChart data={barChartArray}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <Tooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dashed" />}
                />
                <Bar dataKey="income" fill="hsl(var(--chart-1))" radius={4} />
                <Bar dataKey="expense" fill="hsl(var(--chart-2))" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>Category-wise Breakdown</CardTitle>
            <CardDescription>Breakdown of expenses by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square max-h-[250px]"
            >
              <PieChart>
                <Tooltip
                  content={<ChartTooltipContent nameKey="amount" hideLabel />}
                />
                <Pie data={pieChartData} dataKey="amount">
                  <LabelList
                    dataKey="category"
                    className="fill-background"
                    stroke="none"
                    fontSize={12}
                    formatter={(value) => chartConfig[value]?.label}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>A list of your recent transactions.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Date</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">
                    {dayjs(transaction.date).format("DD MMM YYYY")}
                  </TableCell>
                  <TableCell>{transaction.title}</TableCell>
                  <TableCell>{transaction.category}</TableCell>
                  <TableCell>{transaction.type}</TableCell>
                  <TableCell className="text-right">₹{transaction.amount}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>
                    <div className="space-x-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setCurrentTransaction(transaction);
                          setIsModalOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            onClick={() => {
                              setTransactionToDelete(transaction.id);
                              setIsAlertOpen(true);
                            }}
                          >
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the transaction.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel
                              onClick={() => setIsAlertOpen(false)}
                            >
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteTransaction(transactionToDelete)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentTransaction?.id ? "Edit Transaction" : "Add Transaction"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={currentTransaction?.title || ""}
                onChange={(e) =>
                  setCurrentTransaction({
                    ...currentTransaction,
                    title: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={currentTransaction?.amount || ""}
                onChange={(e) =>
                  setCurrentTransaction({
                    ...currentTransaction,
                    amount: parseFloat(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <DatePicker
                selectedDate={currentTransaction?.date ? new Date(currentTransaction.date) : new Date()}
                onDateChange={(date) =>
                  setCurrentTransaction({
                    ...currentTransaction,
                    date: date.toISOString(),
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={currentTransaction?.category || ""}
                onValueChange={(value) =>
                  setCurrentTransaction({
                    ...currentTransaction,
                    category: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {TRANSACTION_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Select
                value={currentTransaction?.type || ""}
                onValueChange={(value) =>
                  setCurrentTransaction({
                    ...currentTransaction,
                    type: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  {TRANSACTION_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Notes</Label>
              <Textarea
                id="description"
                value={currentTransaction?.description || ""}
                onChange={(e) =>
                  setCurrentTransaction({
                    ...currentTransaction,
                    description: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddEditTransaction}>
              {currentTransaction?.id ? "Update" : "Add"} Transaction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MonthlyExpenses;

