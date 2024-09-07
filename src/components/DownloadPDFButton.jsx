import React from "react";
import { Button } from "@/components/ui/button";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable"; // Import autoTable plugin for jsPDF

const DownloadPDFButton = ({ data, selectedMonth }) => {
  const generatePDF = () => {
    const doc = new jsPDF();

    // Check if month is correctly passed
    const month = selectedMonth || "Unknown Month"; // Fallback if month is undefined

    // Set font and styling for the title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(`Attendance Report for ${month}`, 14, 20);

    // Modern and minimalistic styling: use a black background and white font for the table header
    const tableHeaders = [
      { content: "Name", styles: { halign: 'center', fillColor: [0, 0, 0], textColor: [255, 255, 255] } },
      { content: "Days Present", styles: { halign: 'center', fillColor: [0, 0, 0], textColor: [255, 255, 255] } },
      { content: "Days Absent", styles: { halign: 'center', fillColor: [0, 0, 0], textColor: [255, 255, 255] } },
      { content: "Days Late", styles: { halign: 'center', fillColor: [0, 0, 0], textColor: [255, 255, 255] } },
      { content: "Avg. Check-in", styles: { halign: 'center', fillColor: [0, 0, 0], textColor: [255, 255, 255] } },
    ];

    const tableData = data.map((record) => [
      { content: record.name, styles: { halign: 'center' } },
      { content: record.daysPresent, styles: { halign: 'center' } },
      { content: record.daysAbsent, styles: { halign: 'center' } },
      { content: record.daysLate, styles: { halign: 'center' } },
      { content: record.averageCheckIn, styles: { halign: 'center' } },
    ]);

    // Generate the table with autoTable
    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
      startY: 30,
      theme: 'grid',
      headStyles: {
        fontSize: 10,
        fontStyle: 'bold',
        fillColor: [0, 0, 0], // Black header background
        textColor: [255, 255, 255], // White text
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 10,
        textColor: [0, 0, 0], // Black text
        halign: 'center',
      },
      styles: {
        lineColor: [240, 240, 240], // Light grid line color
        lineWidth: 0.5,
      },
      tableLineColor: [240, 240, 240], // Light border color
      tableLineWidth: 0.5,
      margin: { top: 30 },
    });

    // Save the PDF
    doc.save(`Attendance_Report_${month}.pdf`);
  };

  return (
    <Button onClick={generatePDF} className="ml-4">
      Download PDF
    </Button>
  );
};

export default DownloadPDFButton;
