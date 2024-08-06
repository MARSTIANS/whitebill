import React from "react";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import "jspdf-autotable";

const DownloadButton = ({ transactions, reportTitle, reportSubtitle, reportDateRange }) => {
  const downloadPdf = () => {
    const doc = new jsPDF();



    // Calculate the width for the title text
    const pageWidth = doc.internal.pageSize.getWidth();
    const title = reportTitle || "Transactions Report";
    const titleWidth = doc.getStringUnitWidth(title) * doc.internal.getFontSize() / doc.internal.scaleFactor;
    const titleX = (pageWidth - titleWidth) / 2;

    // Add title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(title, titleX, 20);

    
    if (reportDateRange) {
      const dateRangeWidth = doc.getStringUnitWidth(`Date Range: ${reportDateRange}`) * doc.internal.getFontSize() / doc.internal.scaleFactor;
      const dateRangeX = (pageWidth - dateRangeWidth) / 2;
      doc.text(`Date Range: ${reportDateRange}`, dateRangeX, 34);
    }

    // Generate table
    doc.autoTable({
      startY: 40,
      head: [["Date", "Title", "Category", "Type", "Amount", "Notes"]],
      body: transactions.map((transaction) => [
        transaction.date,
        transaction.title,
        transaction.category,
        transaction.type,
        transaction.amount,
        transaction.description,
      ]),
      styles: {
        fontSize: 10,
        font: "helvetica",
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontSize: 11,
      },
      alternateRowStyles: {
        fillColor: [230, 240, 255],
      },
      theme: "striped",
    });

   
    // Save the PDF
    doc.save("transactions-report.pdf");
  };

  return (
    <Button onClick={downloadPdf}>
      Download PDF
    </Button>
  );
};

export default DownloadButton;
