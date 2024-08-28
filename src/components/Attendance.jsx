import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Users, CheckCircle, XCircle } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger, DialogFooter
} from "@/components/ui/dialog"
import { supabase } from "../supabase";
import NotificationDropdown from "./NotificationDropdown";

const Attendance = () => {
  const [staff, setStaff] = useState([]);
  const [newStaff, setNewStaff] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [totalStaff, setTotalStaff] = useState(0);
  const [presentToday, setPresentToday] = useState(0);
  const [absentToday, setAbsentToday] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStaff();
    fetchSummary();
  }, []);

  const fetchStaff = async () => {
    const { data, error } = await supabase.from("staff").select("*");
    if (error) {
      console.error("Error fetching staff:", error);
    } else {
      setStaff(data);
      setTotalStaff(data.length);
    }
  };

  const fetchSummary = async () => {
    const today = new Date().toISOString().split("T")[0];

    // Fetching Present Today
    const { data: presentData, error: presentError } = await supabase
      .from("attendance")
      .select("staff_id")
      .eq("date", today)
      .is("time", null, { negate: true });

    if (presentError) {
      console.error("Error fetching present staff:", presentError);
    } else {
      setPresentToday(new Set(presentData.map((item) => item.staff_id)).size);
      setAbsentToday(totalStaff - presentToday);
    }
  };

  const handleAddStaff = async () => {
    if (newStaff.trim() !== "") {
      const { data, error } = await supabase
        .from("staff")
        .insert([{ name: newStaff.trim() }])
        .select(); // Ensure the select query returns the inserted row
      if (error) {
        console.error("Error adding staff:", error);
      } else if (data && data.length > 0) {
        setStaff([...staff, data[0]]);
        setNewStaff("");
        setTotalStaff(totalStaff + 1);
        setIsDialogOpen(false); // Close the dialog box after adding
      }
    }
  };

  const handleDeleteStaff = async (id) => {
    const { error } = await supabase.from("staff").delete().eq("id", id);
    if (error) {
      console.error("Error deleting staff:", error);
    } else {
      setStaff(staff.filter((member) => member.id !== id));
      setTotalStaff(totalStaff - 1);
      fetchSummary();
    }
  };

  const handleStaffClick = (id) => {
    navigate(`/home/attendance/${id}`);
  };

  const filteredStaff = staff.filter((member) =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="px-4">
    <div className="flex justify-between items-center ">
     <h2 className="text-2xl font-bold mb-4">Attendance</h2>
     <NotificationDropdown />
   </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        {/* Total Staff */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStaff}</div>
          </CardContent>
        </Card>

        {/* Present Today */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{presentToday}</div>
          </CardContent>
        </Card>

        {/* Absent Today */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent Today</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStaff - presentToday}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6 bg-white">
        <CardHeader className="px-6 py-4">
          <CardTitle className="text-lg font-semibold">Manage Staff</CardTitle>
        </CardHeader>
        <CardContent className="px-6 py-4">
          <div className="flex space-x-4 mb-4">
            <Input
              className="flex-grow"
              placeholder="Search staff"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="px-6">Add Staff</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Staff Member</DialogTitle>
                </DialogHeader>
                <Input
                  className="mt-4"
                  placeholder="Enter staff name"
                  value={newStaff}
                  onChange={(e) => setNewStaff(e.target.value)}
                />
                <DialogFooter>
                  <Button onClick={handleAddStaff}>Add Staff</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="px-6 py-3 font-medium text-gray-900">Name</th>
                  <th className="px-6 py-3 font-medium text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStaff.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td
                      className="px-6 py-4 cursor-pointer hover:underline"
                      onClick={() => handleStaffClick(member.id)}
                    >
                      {member.name}
                    </td>
                    <td className="px-6 py-4">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-5 w-5 text-red-600" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the staff member.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteStaff(member.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Attendance;
