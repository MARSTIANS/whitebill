import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
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

const TransactionsTable = ({
  transactions,
  setCurrentTransaction,
  setIsModalOpen,
  setTransactionToDelete,
  setIsAlertOpen,
  handleDeleteTransaction,
}) => (
  <Card className="bg-gray-50">
    <CardHeader>
      <CardTitle>Transactions</CardTitle>
      <CardDescription>A list of recent transactions.</CardDescription>
    </CardHeader>
    <CardContent className="h-[480px] overflow-hidden">
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <div className="overflow-y-auto max-h-[452px]">
          <table className="w-full divide-y-2 divide-gray-200 bg-white text-sm">
            <thead className="bg-white sticky top-0 z-10">
              <tr>
                <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 bg-white">
                  Date
                </th>
                <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 bg-white">
                  Title
                </th>
                <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 bg-white">
                  Category
                </th>
                <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 bg-white">
                  Type
                </th>
                <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 text-right bg-white">
                  Amount
                </th>
                <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 bg-white">
                  Notes
                </th>
                <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 bg-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="hover:bg-gray-100 transition-colors duration-200"
                >
                  <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                    {dayjs(transaction.date).format("DD MMM YYYY")}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                    {transaction.title}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                    {transaction.category}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                    {transaction.type}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-gray-700 text-right">
                    ₹{transaction.amount}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                    {transaction.description}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-gray-700">
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
                            <AlertDialogTitle>
                              Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently
                              delete the transaction.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel
                              onClick={() => setIsAlertOpen(false)}
                            >
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                handleDeleteTransaction(transaction.id)
                              }
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default TransactionsTable;