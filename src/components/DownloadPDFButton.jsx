import React from "react";
import { Button } from "@/components/ui/button";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable"; // Import autoTable plugin for jsPDF

const DownloadPDFButton = ({ data, month }) => {
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text(`Attendance Report for ${month}`, 14, 10);

    const tableData = data.map((record) => [
      record.name,
      record.checkIn,
      record.checkOut,
      record.status,
      record.daysPresent,
      record.daysAbsent,
      record.daysLate,
      record.averageCheckIn,
    ]);

    autoTable(doc, {
      head: [["Name", "Check In", "Check Out", "Status", "Days Present", "Days Absent", "Days Late", "Avg. Check-in"]],
      body: tableData,
      startY: 20,
    });

    doc.save(`Attendance_Report_${month}.pdf`);
  };

  return (
    <Button onClick={generatePDF} className="ml-4">
      Download PDF
    </Button>
  );
};

export default DownloadPDFButton;
