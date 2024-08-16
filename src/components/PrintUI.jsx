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
          <Button className="mt-4 w-full text-white rounded-md py-2 transition-colors">
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
    color: "#333",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    minHeight: "100vh", // Ensure the content takes at least the full height of the page
    boxSizing: "border-box",
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
        }
        
        /* Ensure the entire document has the background color and no extra margins */
        @page {
          size: auto;
          margin: 0;
        }

        body {
          margin: 0;
          padding: 0;
          background-color: #f9f9f9;
          -webkit-print-color-adjust: exact; /* Ensures that background colors are printed */
        }

        html, body {
          height: 100%;
        }

        /* Avoid extra space below content */
        .invoice-container {
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }`
      }
    </style>

    <div className="invoice-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header Section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <div>
          <img src={Logo} alt="Logo" style={{ height: "60px", filter: "grayscale(100%)" }} />
        </div>
        <div style={{ textAlign: "right" }}>
          <h1 style={{ fontFamily: "RoxboroughCF", fontSize: "28pt", margin: "0", color: "#333" }}>INVOICE</h1>
        </div>
      </div>

      {/* Billing Information Section */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "30px" }}>
        <div>
          <h2 style={{ fontFamily: "Inter Medium", fontSize: "14pt", fontWeight: "bold", marginBottom: "10px", color: "#333" }}>BILLED TO:</h2>
          <p style={{ fontFamily: "Inter", fontSize: "12pt", color: "#555", margin: "5px 0", whiteSpace: "pre-wrap" }}>
            {clientDetails || "Client details not provided"}
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontFamily: "Inter", fontSize: "12pt", marginBottom: "5px", color: "#555" }}>Invoice No.: {invoiceNumber}</p>
          <p style={{ fontFamily: "Inter", fontSize: "12pt", marginBottom: "5px", color: "#555" }}>
            Date: {dateRange.from && dateRange.to ? `${format(new Date(dateRange.from), "dd/MM/yyyy")} to ${format(new Date(dateRange.to), "dd/MM/yyyy")}` : "Date Not Specified"}
          </p>
        </div>
      </div>

      {/* Itemized Table Section */}
      <div style={{ marginBottom: "30px", borderTop: "1px solid #bcb8b1", paddingTop: "10px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #bcb8b1", paddingBottom: "10px", marginBottom: "10px" }}>
          <span style={{ fontFamily: "Inter Medium", fontWeight: "bold", fontSize: "12pt", textAlign: "left", flex: 1, color: "#333" }}>Description</span>
          <span style={{ fontFamily: "Inter Medium", fontWeight: "bold", fontSize: "12pt", textAlign: "center", flex: 0.5, color: "#333" }}>Quantity</span>
          <span style={{ fontFamily: "Inter Medium", fontWeight: "bold", fontSize: "12pt", textAlign: "center", flex: 0.5, color: "#333" }}>Number of Days</span>
        </div>
        {items.map((item, index) => (
          <div key={index} style={{ display: "flex", justifyContent: "space-between", margin: "10px 0", borderBottom: "1px solid #bcb8b1", paddingBottom: "10px" }}>
            <span style={{ fontFamily: "Inter", fontSize: "12pt", flex: 1, color: "#555" }}>{item.description || "No description provided"}</span>
            <span style={{ fontFamily: "Inter", fontSize: "12pt", textAlign: "center", flex: 0.5, color: "#555" }}>{item.quantity || "0"}</span>
            <span style={{ fontFamily: "Inter", fontSize: "12pt", textAlign: "center", flex: 0.5, color: "#555" }}>{item.numberOfDays || "0"}</span>
          </div>
        ))}
      </div>

      {/* Total Section */}
      <div style={{ textAlign: "right", marginBottom: "40px" }}>
        <div style={{ paddingTop: "10px" }}>
          <span style={{
            fontFamily: "Inter Medium",
            fontSize: "14pt",
            fontWeight: "bold",
            color: "#333",
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
            textAlign: "right",
            color: "#333"
          }}>₹{parseFloat(total).toFixed(2)}</span>
        </div>
      </div>

      {/* Footer Section */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        {/* Payment Information */}
        <div style={{ textAlign: "left" }}>
          {/* <h3 style={{ fontFamily: "Inter Medium", fontSize: "12pt", fontWeight: "bold", marginBottom: "10px", color: "#333" }}>PAYMENT INFORMATION</h3>
          <p style={{ fontFamily: "Inter", fontSize: "12pt", color: "#555" }}>Account Name: ABC Company</p>
          <p style={{ fontFamily: "Inter", fontSize: "12pt", color: "#555" }}>Bank: XYZ Bank</p>
          <p style={{ fontFamily: "Inter", fontSize: "12pt", color: "#555" }}>Account Number: 123456789</p>
          <p style={{ fontFamily: "Inter", fontSize: "12pt", color: "#555" }}>IFSC Code: XYZB0001234</p> */}
        </div>
        {/* Footer */}
        <div style={{ textAlign: "right" }}>
          <p style={{ fontFamily: "Inter", fontSize: "12pt", color: "#555" }}>White Branding</p>
          <p style={{ fontFamily: "Inter", fontSize: "12pt", color: "#555" }}>Thrissur, Kerala</p>
          <p style={{ fontFamily: "Inter", fontSize: "12pt", color: "#555" }}>9645206022</p>
          <p style={{ fontFamily: "Inter", fontSize: "12pt", color: "#555" }}>whitebranding0@gmail.com</p>
        </div>
      </div>

      {/* Thank You Message */}
      <div style={{ textAlign: "center", marginTop: "40px" }}>
        <p style={{ fontFamily: "RoxboroughCF", fontSize: "14pt", fontStyle: "italic", color: "#333" }}>Thank you!</p>
      </div>
    </div>
  </div>
));

export default PrintUI;
