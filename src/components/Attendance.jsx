import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, Clock, XCircle, MoreVertical } from "lucide-react";
import { supabase } from "../supabase";
import { Input } from "@/components/ui/input";
import NotificationDropdown from "./NotificationDropdown";
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, min } from "date-fns";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import DownloadPDFButton from "./DownloadPDFButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [totalStaff, setTotalStaff] = useState(0);
  const [present, setPresent] = useState(0);
  const [absent, setAbsent] = useState(0);
  const [late, setLate] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [newStaffName, setNewStaffName] = useState("");
  const [newDepartment, setNewDepartment] = useState("");
  const [newPosition, setNewPosition] = useState("");
  const [selectedStaff, setSelectedStaff] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return format(now, 'MMMM yyyy');
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const navigate = useNavigate();

  const officeStartTime = "10:00";
  const lateThreshold = "10:10";

  useEffect(() => {
    fetchAttendanceDataForMonth();
  }, [selectedMonth]);

  const fetchAttendanceDataForMonth = async () => {
    const [month, year] = selectedMonth.split(" ");
    const firstDay = startOfMonth(new Date(`${month} 1, ${year}`));
    const lastDay = endOfMonth(firstDay);
    const today = new Date();
    const lastRelevantDay = min([lastDay, today]);
    const daysInMonth = eachDayOfInterval({ start: firstDay, end: lastRelevantDay });

    try {
      const { data: staffData, error: staffError } = await supabase.from("staff").select("*");
      if (staffError) throw staffError;

      const { data: attendanceData, error: attendanceError } = await supabase
        .from("attendance")
        .select("staff_id, date, time")
        .gte("date", format(firstDay, "yyyy-MM-dd"))
        .lte("date", format(lastRelevantDay, "yyyy-MM-dd"));
      if (attendanceError) throw attendanceError;

      const staffMap = staffData.reduce((acc, staff) => {
        acc[staff.id] = {
          id: staff.id,
          name: staff.name,
          department: staff.department,
          position: staff.position,
          daysPresent: 0,
          daysLate: 0,
          daysAbsent: daysInMonth.length,
          totalCheckInTime: 0,
          checkInCount: 0,
          status: "Absent",
          checkIn: "-",
          checkOut: "-",
        };
        return acc;
      }, {});

      daysInMonth.forEach(day => {
        const dayAttendance = attendanceData.filter(record => isSameDay(parseISO(record.date), day));
        
        staffData.forEach(staff => {
          const staffDayAttendance = dayAttendance.filter(record => record.staff_id === staff.id);
          
          if (staffDayAttendance.length > 0) {
            const checkInTime = staffDayAttendance[0].time;
            const checkOutTime = staffDayAttendance[staffDayAttendance.length - 1].time;
            const status = checkInTime <= lateThreshold ? "Present" : "Late";

            staffMap[staff.id].daysAbsent -= 1;
            staffMap[staff.id].daysPresent += 1;
            if (status === "Late") {
              staffMap[staff.id].daysLate += 1;
            }
            staffMap[staff.id].totalCheckInTime += parseFloat(checkInTime.split(':')[0]) + parseFloat(checkInTime.split(':')[1]) / 60;
            staffMap[staff.id].checkInCount += 1;

            if (isSameDay(day, today)) {
              staffMap[staff.id].status = status;
              staffMap[staff.id].checkIn = checkInTime;
              staffMap[staff.id].checkOut = checkOutTime;
            }
          }
        });
      });

      Object.values(staffMap).forEach(staff => {
        staff.averageCheckIn = staff.checkInCount > 0 
          ? format(new Date(0, 0, 0, 0, Math.round(staff.totalCheckInTime / staff.checkInCount * 60)), 'HH:mm')
          : '-';
      });

      const staffList = Object.values(staffMap);
      const presentCount = staffList.filter((staff) => staff.status === "Present" || staff.status === "Late").length; // Include late as present
      const lateCount = staffList.filter((staff) => staff.status === "Late").length;
      const absentCount = staffList.filter((staff) => staff.status === "Absent").length;

      setAttendanceData(staffList);
      setTotalStaff(staffData.length);
      setPresent(presentCount); // Include both present and late
      setLate(lateCount);
      setAbsent(absentCount);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    }
  };

  const handleAddStaff = async () => {
    if (newStaffName.trim() && newDepartment.trim() && newPosition.trim()) {
      const { data, error } = await supabase
        .from("staff")
        .insert([{ name: newStaffName.trim(), department: newDepartment.trim(), position: newPosition.trim() }]);
      if (error) {
        console.error("Error adding new staff:", error);
      } else {
        setNewStaffName("");
        setNewDepartment("");
        setNewPosition("");
        setIsDialogOpen(false); // Close the dialog after saving
        fetchAttendanceDataForMonth(); // Refresh attendance data after adding a staff member
      }
    }
  };

  const handleEditStaff = async () => {
    if (selectedStaff.name && selectedStaff.department && selectedStaff.position) {
      const { error } = await supabase
        .from("staff")
        .update({
          name: selectedStaff.name,
          department: selectedStaff.department,
          position: selectedStaff.position,
        })
        .eq("id", selectedStaff.id);

      if (error) {
        console.error("Error updating staff:", error);
      } else {
        setIsEditDialogOpen(false);
        fetchAttendanceDataForMonth(); // Refresh attendance data
      }
    }
  };

  const handleDeleteStaff = async () => {
    if (selectedStaff) {
      const { error } = await supabase.from("staff").delete().eq("id", selectedStaff.id);
      if (error) {
        console.error("Error deleting staff:", error);
      } else {
        setIsAlertDialogOpen(false);
        fetchAttendanceDataForMonth(); // Refresh attendance data
      }
    }
  };

  const openEditDialog = (staff) => {
    setSelectedStaff(staff); // Set the selected staff's full details
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (staff) => {
    setSelectedStaff(staff);
    setIsAlertDialogOpen(true);
  };

  const handleViewReport = (staffId) => {
    navigate(`/home/attendance/${staffId}`); // Redirect to individual attendance report
  };

  const filteredAttendanceData = attendanceData.filter((staff) =>
    staff.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      options.push(format(date, "MMMM yyyy"));
    }
    return options;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold ml-2 md:-ml-0">Attendance Report</h1>
        <div className="flex items-center space-x-4">
          <NotificationDropdown />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStaff}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{present}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{late}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{absent}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
            <CardTitle>Attendance Details</CardTitle>
            <div className="flex items-center space-x-4">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {generateMonthOptions().map((month) => (
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Search staff"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-[200px]"
              />
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary">Add Staff</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Staff</DialogTitle>
                <DialogDescription>Fill in the details of the new staff member.</DialogDescription>
              </DialogHeader>
              <Input
                placeholder="Staff Name"
                value={newStaffName}
                onChange={(e) => setNewStaffName(e.target.value)}
                className="mb-2"
              />
              <Input
                placeholder="Department"
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
                className="mb-2"
              />
              <Input
                placeholder="Position"
                value={newPosition}
                onChange={(e) => setNewPosition(e.target.value)}
                className="mb-4"
              />
              <Button onClick={handleAddStaff}>Add Staff</Button>
            </DialogContent>
          </Dialog>
              <DownloadPDFButton data={filteredAttendanceData} selectedMonth={selectedMonth} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Current Date</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Days Present</TableHead>
                <TableHead>Days Absent</TableHead>
                <TableHead>Days Late</TableHead>
                <TableHead>Avg Check-in</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAttendanceData.map((record) => (
                <TableRow key={record.id} className="cursor-pointer hover:bg-gray-100">
                  <TableCell className="font-medium">{record.name}</TableCell>
                  <TableCell>{new Date().toISOString().split("T")[0]}</TableCell>
                  <TableCell>{record.checkIn}</TableCell>
                  <TableCell>{record.checkOut}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        record.status === "Present"
                          ? "default"
                          : record.status === "Late"
                          ? "warning"
                          : "destructive"
                      }
                    >
                      {record.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{record.daysPresent}</TableCell>
                  <TableCell className="text-center">{record.daysAbsent}</TableCell>
                  <TableCell className="text-center">{record.daysLate}</TableCell>
                  <TableCell className="text-center">{record.averageCheckIn}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <MoreVertical className="h-5 w-5 cursor-pointer" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem className="cursor-pointer font-medium" onClick={() => handleViewReport(record.id)}>View</DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer font-medium" onClick={() => openEditDialog(record)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer font-medium" onClick={() => openDeleteDialog(record)}>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Staff Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Staff</DialogTitle>
            <DialogDescription>Update the details of the staff member.</DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Staff Name"
            value={selectedStaff?.name || ""}
            onChange={(e) => setSelectedStaff({ ...selectedStaff, name: e.target.value })}
            className="mb-2"
          />
          <Input
            placeholder="Department"
            value={selectedStaff?.department || ""}
            onChange={(e) => setSelectedStaff({ ...selectedStaff, department: e.target.value })}
            className="mb-2"
          />
          <Input
            placeholder="Position"
            value={selectedStaff?.position || ""}
            onChange={(e) => setSelectedStaff({ ...selectedStaff, position: e.target.value })}
            className="mb-4"
          />
          <Button onClick={handleEditStaff}>Save</Button>
        </DialogContent>
      </Dialog>

      {/* Delete Staff Alert Dialog */}
      <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this staff member?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone and will permanently delete the staff member.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteStaff}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Attendance;
