import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import ReactToPrint from "react-to-print";
import RoxboroughCF from "@/assets/fonts/Roxborough-CF.ttf";
import Inter from "@/assets/fonts/Inter-Regular.ttf";
import InterMedium from "@/assets/fonts/Inter-Medium.ttf";
import { format } from "date-fns";  
import Logo from "@/assets/logo.png"; 

const PrintUI = ({ items, total, onBillGenerated, invoiceNumber, dateRange, clientDetails }) => {
  const componentRef = useRef();

  const handleAfterPrint = () => {
    onBillGenerated();
  };

  return (
    <div>
      <ReactToPrint
        trigger={() => (
          <Button className="mt-4 w-full">
            Print Invoice 
          </Button>
        )}
        content={() => componentRef.current}
        onAfterPrint={handleAfterPrint}
      />

      {/* Hidden Component for Printing */}
      <div style={{ display: "none" }}>
        <InvoicePrintComponent
          ref={componentRef}
          items={items}
          total={total}
          invoiceNumber={invoiceNumber}
          dateRange={dateRange}
          clientDetails={clientDetails}
        />
      </div>
    </div>
  );
};

const InvoicePrintComponent = React.forwardRef(({ items, total, invoiceNumber, dateRange, clientDetails }, ref) => (
  <div ref={ref} style={{
    padding: "40px",
    fontFamily: "Inter, sans-serif",
    maxWidth: "800px",
    margin: "0 auto",
    color: "black",
    
  }}>
    <style>
      {
        `@font-face {
          font-family: 'RoxboroughCF';
          src: url(${RoxboroughCF}) format('truetype');
        }
        @font-face {
          font-family: 'Inter';
          src: url(${Inter}) format('truetype');
        }
        @font-face {
          font-family: 'Inter Medium';
          src: url(${InterMedium}) format('truetype');
        }`
      }
    </style>

    {/* Logo and Invoice Title */}
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
      <div>
        <img src={Logo} alt="Logo" style={{ height: "60px" }} /> {/* Using the imported logo */}
      </div>
      <div style={{ textAlign: "right" }}>
        <h1 style={{ fontFamily: "RoxboroughCF", fontSize: "32pt", margin: "0" }}>INVOICE</h1>
        <p style={{ fontFamily: "Inter Medium", fontSize: "12pt", margin: "5px 0 0" }}>Invoice No. {invoiceNumber}</p>
        <p style={{ fontFamily: "Inter Medium", fontSize: "12pt", margin: "5px 0 0" }}>
          {dateRange.from && dateRange.to ? `${format(new Date(dateRange.from), "dd/MM/yyyy")} - ${format(new Date(dateRange.to), "dd/MM/yyyy")}` : "Date Not Specified"}
        </p>
      </div>
    </div>

    {/* Billed To Section */}
    <div style={{ marginBottom: "20px", paddingBottom: "10px" }}>
      <h2 style={{ fontFamily: "Inter Medium", fontSize: "14pt", fontWeight: "bold", marginBottom: "10px" }}>BILLED TO:</h2>
      <p style={{ fontFamily: "Inter", fontSize: "12pt",color: "#555555" , margin: "5px 0", whiteSpace: "pre-wrap" }}>
        {clientDetails || "Client details not provided"}
      </p>
    </div>

    {/* Itemized Table */}
    <div style={{ marginBottom: "20px", borderTop: "1px solid #736f72" }}>
      <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "10px", borderBottom: "1px solid #736f72", paddingBottom: "10px", marginBottom: "10px" }}>
        <span style={{ fontFamily: "Inter Medium", fontWeight: "bold", fontSize: "12pt", textAlign: "left", flex: 1 }}>Description</span>
        <span style={{ fontFamily: "Inter Medium", fontWeight: "bold", fontSize: "12pt", textAlign: "center", flex: 0.5 }}>Quantity</span>
        <span style={{ fontFamily: "Inter Medium", fontWeight: "bold", fontSize: "12pt", textAlign: "center", flex: 0.5 }}>Number of Days</span>
      </div>
      {items.map((item, index) => (
        <div key={index} style={{ display: "flex", justifyContent: "space-between", margin: "10px 0", borderBottom: "1px solid #736f72", paddingBottom: "10px" }}>
          <span style={{ fontFamily: "Inter", fontSize: "12pt", flex: 1 }}>{item.description || "No description provided"}</span>
          <span style={{ fontFamily: "Inter", fontSize: "12pt", textAlign: "center", flex: 0.5 }}>{item.quantity || "0"}</span>
          <span style={{ fontFamily: "Inter", fontSize: "12pt", textAlign: "center", flex: 0.5 }}>{item.numberOfDays || "0"}</span>
        </div>
      ))}
    </div>

    {/* Total Section */}
    <div style={{ marginTop: "10px", textAlign: "right", marginBottom: "20px", position: "relative" }}>
      <div style={{ paddingTop: "10px" }}>
        <span style={{
          fontFamily: "Inter Medium",
          fontSize: "14pt",
          fontWeight: "bold",
          color: "black",
          display: "inline-block",
          width: "150px",
          textAlign: "right"
        }}>Total</span>
        <span style={{
          fontFamily: "Inter",
          fontSize: "14pt",
          fontWeight: "bold",
          display: "inline-block",
          marginLeft: "20px",
          textAlign: "right"
        }}>₹{parseFloat(total).toFixed(2)}</span>
      </div>
    </div>

    {/* Thank You Message */}
    <div style={{ textAlign: "center", marginBottom: "40px" }}>
      <p style={{ fontFamily: "RoxboroughCF", fontSize: "12pt", fontStyle: "italic" }}>Thank you!</p>
    </div>

      {/* Payment Information */}
      <div style={{ textAlign: "left", marginBottom: "20px" }}>
      <h3 style={{ fontFamily: "Inter Medium", fontSize: "12pt", fontWeight: "bold", marginBottom: "10px", color: "#333333" }}>PAYMENT INFORMATION</h3>
      <p style={{ fontFamily: "Inter", fontSize: "12pt", color: "#555555" }}>Account Name: ABC Company</p>
      <p style={{ fontFamily: "Inter", fontSize: "12pt", color: "#555555" }}>Bank: XYZ Bank</p>
      <p style={{ fontFamily: "Inter", fontSize: "12pt", color: "#555555" }}>Account Number: 123456789</p>
      <p style={{ fontFamily: "Inter", fontSize: "12pt", color: "#555555" }}>IFSC Code: XYZB0001234</p>
    </div>

    {/* Footer */}
    <div style={{ textAlign: "right", borderTop: "1px solid #ddd", paddingTop: "10px", fontFamily: "Inter", fontSize: "10pt", color: "#999999" }}>
      <p>Company Name | Address | Phone | Email</p>
    </div>
  </div>
));

export default PrintUI;
