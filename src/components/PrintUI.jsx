import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import ReactToPrint from "react-to-print";
import RoxboroughCF from "@/assets/fonts/Roxborough-CF.ttf";
import Inter from "@/assets/fonts/Inter-Regular.ttf";
import InterMedium from "@/assets/fonts/Inter-Medium.ttf";

const PrintUI = ({ items, calculateTotal }) => {
  const componentRef = useRef();

  return (
    <div>
      <ReactToPrint
        trigger={() => (
          <Button className="mt-4 w-full">
            Generate Invoice PDF
          </Button>
        )}
        content={() => componentRef.current}
      />

      {/* Hidden Component for Printing */}
      <div style={{ display: "none" }}>
        <InvoicePrintComponent ref={componentRef} items={items} calculateTotal={calculateTotal} />
      </div>
    </div>
  );
};

const InvoicePrintComponent = React.forwardRef(({ items, calculateTotal }, ref) => (
  <div ref={ref} style={{
    padding: "40px",
    fontFamily: "Inter, sans-serif",
    maxWidth: "800px",
    margin: "0 auto",
    color: "black",
    backgroundColor: "white",
  }}>
    <style>
      {`
        @font-face {
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
      `}
    </style>

    {/* Logo and Invoice Title */}
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
      <div style={{ fontSize: "72px", fontWeight: "bold", fontFamily: 'RoxboroughCF' }}>&</div>
      <div style={{ textAlign: "right" }}>
        <h1 style={{ fontFamily: "RoxboroughCF", fontSize: "36pt", margin: "0" }}>INVOICE</h1>
        <p style={{ fontFamily: "Inter Medium", fontSize: "14pt", margin: "5px 0 0" }}>Invoice No. 12345</p>
        <p style={{ fontFamily: "Inter Medium", fontSize: "14pt", margin: "5px 0 0" }}>16 June 2025</p>
      </div>
    </div>

    {/* Billed To Section */}
    <div style={{ marginBottom: "40px", paddingBottom: "10px" }}>
      <h2 style={{ fontFamily: "Inter Medium", fontSize: "14pt", marginBottom: "10px" }}>BILLED TO:</h2>
      <p style={{ fontFamily: "Inter", fontSize: "12pt", margin: "5px 0" }}>Imani Olowe</p>
      <p style={{ fontFamily: "Inter", fontSize: "12pt", margin: "5px 0" }}>+123-456-7890</p>
      <p style={{ fontFamily: "Inter", fontSize: "12pt", margin: "5px 0" }}>63 Ivy Road, Hawkville, GA, USA 31036</p>
    </div>

    {/* Itemized Table */}
    <div style={{ marginBottom: "40px" , borderTop: "1px solid black", }}>
      <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "10px ", borderBottom: "1px solid black", paddingBottom: "10px", marginBottom: "10px" }}>
        <span style={{ fontFamily: "Inter Medium", fontSize: "12pt" }}>Description</span>
        <span style={{ fontFamily: "Inter Medium", fontSize: "12pt" }}>Total</span>
      </div>
      {items.map((item, index) => (
        <div key={index} style={{ display: "flex", justifyContent: "space-between", margin: "10px 0" ,borderBottom: "1px solid black", paddingBottom: "10px" }}>
          <span style={{ fontFamily: "Inter", fontSize: "12pt" }}>{item.description}</span>
          <span style={{ fontFamily: "Inter", fontSize: "12pt" }}>${parseFloat(item.total).toFixed(2)}</span>
        </div>
      ))}
    </div>

    {/* Subtotal and Total */}
    <div style={{  paddingTop: "10px", textAlign: "right", marginBottom: "40px" }}>
      <p style={{ fontFamily: "Inter Medium", fontSize: "12pt", margin: "5px 0" }}>Subtotal: ${calculateTotal().toFixed(2)}</p>
      <p style={{ fontFamily: "Inter Medium", fontSize: "12pt", margin: "5px 0", fontWeight: "bold", color: "#000" }}>Total: ${calculateTotal().toFixed(2)}</p>
    </div>

   

    {/* Thank You Message */}
    <div style={{ textAlign: "center", marginBottom: "40px" }}>
      <p style={{ fontFamily: "RoxboroughCF", fontSize: "12pt", fontStyle: "italic" }}>Thank you!</p>
    </div>

    {/* Footer */}
    <div style={{ textAlign: "center", borderTop: "1px solid black", paddingTop: "10px", fontFamily: "Inter", fontSize: "10pt" }}>
      <p>Company Name | Address | Phone | Email</p>
    </div>
  </div>
));

export default PrintUI;
