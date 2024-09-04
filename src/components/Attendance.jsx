import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, Clock, XCircle } from "lucide-react";
import { supabase } from "../supabase";
import NotificationDropdown from "./NotificationDropdown";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import DownloadPDFButton from "./DownloadPDFButton";  // Component for generating the PDF

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [totalStaff, setTotalStaff] = useState(0);
  const [present, setPresent] = useState(0);
  const [absent, setAbsent] = useState(0);
  const [late, setLate] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [averageCheckInTime, setAverageCheckInTime] = useState("-");
  const navigate = useNavigate();

  const officeStartTime = "10:00"; // Office start time in HH:MM format
  const officeEndTime = "18:30"; // Office end time in HH:MM format

  useEffect(() => {
    fetchCurrentDayAttendanceData();  // Fetch current day's data on component load
  }, []);

  const fetchCurrentDayAttendanceData = async () => {
    const today = new Date().toISOString().split("T")[0];

    // Fetch staff data
    const { data: staffData, error: staffError } = await supabase.from("staff").select("*");
    if (staffError) {
      console.error("Error fetching staff data:", staffError);
      return;
    }

    // Fetch current day's attendance data
    const { data: attendanceData, error: attendanceError } = await supabase
      .from("attendance")
      .select("staff_id, date, time")
      .eq("date", today);  // Only fetch today's data
    if (attendanceError) {
      console.error("Error fetching attendance data:", attendanceError);
      return;
    }

    // Create a staff map for attendance
    const staffMap = staffData.reduce((acc, staff) => {
      acc[staff.id] = {
        id: staff.id,
        name: staff.name,
        checkIn: null,
        checkOut: null,
        status: "Absent",
        daysPresent: 0,
        daysLate: 0,
        totalCheckInMinutes: 0,
        checkInCount: 0
      };
      return acc;
    }, {});

    // Process attendance data for the current day
    attendanceData.forEach((record) => {
      const checkInTime = record.time;

      // Set the first record as check-in and the last as check-out for each staff
      if (!staffMap[record.staff_id].checkIn || record.time < staffMap[record.staff_id].checkIn) {
        staffMap[record.staff_id].checkIn = checkInTime;
      }
      if (!staffMap[record.staff_id].checkOut || record.time > staffMap[record.staff_id].checkOut) {
        staffMap[record.staff_id].checkOut = checkInTime;
      }

      const status = checkInTime <= officeStartTime ? "Present" : "Late";
      staffMap[record.staff_id].status = status;

      // Update attendance status and stats
      if (status === "Present") {
        staffMap[record.staff_id].daysPresent += 1;
      } else if (status === "Late") {
        staffMap[record.staff_id].daysLate += 1;
      }

      // Calculate average check-in time
      const checkInMinutes = convertTimeToMinutes(checkInTime);
      staffMap[record.staff_id].totalCheckInMinutes += checkInMinutes;
      staffMap[record.staff_id].checkInCount += 1;
    });

    const staffList = Object.values(staffMap);
    const presentCount = staffList.filter((staff) => staff.status === "Present" || staff.status === "Late").length;
    const lateCount = staffList.filter((staff) => staff.status === "Late").length;
    const absentCount = staffList.filter((staff) => staff.status === "Absent").length;

    // Calculate the overall average check-in time
    let totalMinutes = 0;
    let totalCheckInCount = 0;
    staffList.forEach((staff) => {
      totalMinutes += staff.totalCheckInMinutes;
      totalCheckInCount += staff.checkInCount;
    });
    const overallAvgCheckIn = totalCheckInCount > 0 ? formatMinutesToTime(Math.round(totalMinutes / totalCheckInCount)) : "-";

    // Update state
    setAttendanceData(staffList);
    setTotalStaff(staffData.length);
    setPresent(presentCount);  // Includes both "Present" and "Late" employees
    setLate(lateCount);
    setAbsent(absentCount);
    setAverageCheckInTime(overallAvgCheckIn);
  };

  const convertTimeToMinutes = (timeStr) => {
    const [hour, minute] = timeStr.split(":").map(Number);
    return hour * 60 + minute;
  };

  const formatMinutesToTime = (totalMinutes) => {
    if (isNaN(totalMinutes)) return "-";  // Safeguard for invalid values
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const date = new Date();
    date.setHours(hours, minutes);
    return format(date, "hh:mm a");
  };

  // Handle navigating to individual attendance page
  const handleStaffClick = (staffId) => {
    navigate(`/home/attendance/${staffId}`);
  };

  const filteredAttendanceData = attendanceData.filter((staff) =>
    staff.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container ">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Staff Attendance Report</h1>
        <NotificationDropdown />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
        {/* Total Employees */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStaff}</div>
          </CardContent>
        </Card>

        {/* Present Employees */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{present}</div>
          </CardContent>
        </Card>

        {/* Late Employees */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{late}</div>
          </CardContent>
        </Card>

        {/* Absent Employees */}
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

      {/* Attendance Details Table */}
      <Card>
        <CardHeader>
       <div className="flex justify-between items-center mb-4">
          <CardTitle>Attendance Details</CardTitle>
       <div className="flex space-x-4">
        <Input
          placeholder="Search staff"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-[200px]"
        />
        <DownloadPDFButton data={filteredAttendanceData} />
      </div>
      </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Days Present</TableHead>
                <TableHead>Days Late</TableHead>
                <TableHead>Average Check-in</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAttendanceData.map((record) => (
                <TableRow
                  key={record.id}
                  onClick={() => handleStaffClick(record.id)} // Click handler to navigate to individual attendance
                  className="cursor-pointer hover:bg-gray-100"
                >
                  <TableCell className="font-medium">{record.name}</TableCell>
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
                  <TableCell>{record.daysPresent}</TableCell>
                  <TableCell>{record.daysLate}</TableCell>
                  <TableCell>{formatMinutesToTime(record.totalCheckInMinutes / record.checkInCount)}</TableCell>
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
