import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "../supabase";
import { ChevronLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, CartesianGrid, Tooltip } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const StaffAttendanceDetails = () => {
  const { id } = useParams();
  const [attendance, setAttendance] = useState([]);
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStaffDetails();
    fetchAttendanceDetails();
  }, [id]);

  const fetchStaffDetails = async () => {
    const { data, error } = await supabase
      .from("staff")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      console.error("Error fetching staff details:", error);
    } else {
      setStaff(data);
    }
    setLoading(false);
  };

  const fetchAttendanceDetails = async () => {
    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .eq("staff_id", id)
      .order("date", { ascending: true })
      .order("time", { ascending: true });
    if (error) console.error("Error fetching attendance details:", error);
    else setAttendance(data);
  };

  const prepareChartData = () => {
    const groupedByDate = attendance.reduce((acc, record) => {
      if (!acc[record.date]) {
        acc[record.date] = { date: record.date, clockIn: null, clockOut: null };
      }
      if (!acc[record.date].clockIn) {
        acc[record.date].clockIn = new Date(`${record.date}T${record.time}`);
      } else {
        acc[record.date].clockOut = new Date(`${record.date}T${record.time}`);
      }
      return acc;
    }, {});

    return Object.values(groupedByDate).map(({ date, clockIn, clockOut }) => {
      const hoursWorked = clockIn && clockOut
        ? (clockOut - clockIn) / (1000 * 60 * 60) // Convert milliseconds to hours
        : 0;
      return {
        date: new Date(date).toLocaleDateString(),
        hoursWorked: hoursWorked.toFixed(2),
      };
    });
  };

  const chartData = prepareChartData();

  const chartConfig = {
    hoursWorked: {
      label: "Hours Worked",
      color: "hsl(var(--chart-1))",
    },
  };

  return (
    <div>
      <Card className="bg-gray-50">
        <CardHeader>
          <div className="flex justify-between">
            {loading ? (
              <Skeleton className="w-[200px] h-[24px] rounded" />
            ) : (
              <CardTitle>Attendance Details for {staff?.name}</CardTitle>
            )}
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>
              <Skeleton className="w-full h-[20px] mb-4" />
              <Skeleton className="w-full h-[20px] mb-4" />
              <Skeleton className="w-full h-[20px] mb-4" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-lg border border-gray-200 mb-8">
                <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
                  <thead className="ltr:text-left rtl:text-right">
                    <tr>
                      <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                        Date
                      </th>
                      <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                        Clock In
                      </th>
                      <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                        Clock Out
                      </th>
                      <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {chartData.map((entry, index) => (
                      <tr key={index}>
                        <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                          {entry.date}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                          {attendance[index * 2]?.time || "N/A"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                          {attendance[index * 2 + 1]?.time || "N/A"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                          {entry.hoursWorked > 0 ? "Present" : "Absent"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Line Chart with ShadCN Styles */}
              <div className="mt-6">
                <ChartContainer config={chartConfig}>
                  <LineChart
                    data={chartData}
                    margin={{
                      left: 12,
                      right: 12,
                    }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <Tooltip content={<ChartTooltipContent hideLabel />} />
                    <Line
                      dataKey="hoursWorked"
                      type="natural"
                      stroke="var(--color-hoursWorked)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ChartContainer>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffAttendanceDetails;
