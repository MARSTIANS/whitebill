import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, Clock, XCircle } from "lucide-react";
import { supabase } from "../supabase";
import NotificationDropdown from "./NotificationDropdown";
import { format } from "date-fns";

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [totalStaff, setTotalStaff] = useState(0);
  const [present, setPresent] = useState(0);
  const [absent, setAbsent] = useState(0);
  const [late, setLate] = useState(0);
  const navigate = useNavigate();

  const officeStartTime = "10:00";
  const officeEndTime = "18:30";

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    const today = new Date().toISOString().split("T")[0];

    const { data: staffData, error: staffError } = await supabase.from("staff").select("*");
    if (staffError) {
      console.error("Error fetching staff data:", staffError);
      return;
    }

    const { data: attendanceData, error: attendanceError } = await supabase
      .from("attendance")
      .select("staff_id, date, time")
      .eq("date", today);
    if (attendanceError) {
      console.error("Error fetching attendance data:", attendanceError);
      return;
    }

    const staffMap = staffData.reduce((acc, staff) => {
      acc[staff.id] = { name: staff.name, status: "Absent", checkIn: "-", checkOut: "-" };
      return acc;
    }, {});

    attendanceData.forEach((record) => {
      const checkInTime = record.time;
      const status = checkInTime <= officeStartTime ? "Present" : "Late";
      if (!staffMap[record.staff_id].checkIn || staffMap[record.staff_id].checkIn === "-") {
        staffMap[record.staff_id].checkIn = checkInTime;
        staffMap[record.staff_id].status = status;
      } else {
        staffMap[record.staff_id].checkOut = checkInTime;
      }
    });

    const staffList = Object.values(staffMap);
    const presentCount = staffList.filter((staff) => staff.status === "Present").length;
    const lateCount = staffList.filter((staff) => staff.status === "Late").length;
    const absentCount = staffList.filter((staff) => staff.status === "Absent").length;

    setAttendanceData(staffList);
    setTotalStaff(staffData.length);
    setPresent(presentCount);
    setLate(lateCount);
    setAbsent(absentCount);
  };

  const handleStaffClick = (staffId) => {
    navigate(`/home/attendance/${staffId}`);
  };

  return (
    <div className="container ">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Staff Attendance Report</h1>
        <NotificationDropdown />
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
          <CardTitle>Attendance Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceData.map((record, index) => (
                <TableRow
                  key={index}
                  onClick={() => handleStaffClick(record.id)} // Navigate to the individual attendance page
                  className="cursor-pointer hover:bg-gray-100"
                >
                  <TableCell className="font-medium">{record.name}</TableCell>
                  <TableCell>{format(new Date(), "yyyy-MM-dd")}</TableCell>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Attendance;
