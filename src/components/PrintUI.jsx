import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import ReactToPrint from "react-to-print";
import RoxboroughCF from "@/assets/fonts/Roxborough-CF.ttf";
import Inter from "@/assets/fonts/Inter-Regular.ttf";
import InterMedium from "@/assets/fonts/Inter-Medium.ttf";
import Logo from "@/assets/logo1.png"; 

const PrintUI = ({ items, total, onBillGenerated, date, clientDetails }) => {
  const componentRef = useRef();

  const handlePrint = async () => {
    await onBillGenerated();
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
        onBeforeGetContent={handlePrint}
      />

      <div style={{ display: "none" }}>
        <InvoicePrintComponent
          ref={componentRef}
          items={items}
          total={total}
          date={date}
          clientDetails={clientDetails}
        />
      </div>
    </div>
  );
};

class InvoicePrintComponent extends React.Component {
  render() {
    const { items, total, date, clientDetails } = this.props;

    return (
      <div ref={this.props.forwardedRef} style={{
        padding: "40px",
        fontFamily: "Inter, sans-serif",
        maxWidth: "800px",
        margin: "0 auto",
        color: "#333",
        backgroundColor: "#f9f9f9",
        borderRadius: "8px",
        minHeight: "100vh",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "30px" }}>
          <div style={{ display: "flex", alignItems: "center", marginLeft: "-35px" }}>
            <img src={Logo} alt="Logo" style={{ width: '250px', height: '170' }} />
          </div>
          <div style={{ textAlign: "right" }}>
            <h1 style={{ fontFamily: "RoxboroughCF", fontSize: "28pt", margin: "0", color: "#333" }}>INVOICE</h1>
            <p style={{ fontFamily: "Inter", fontSize: "12pt", marginTop: "10px", color: "#555" }}>
              Date: {date || "Date Not Specified"}  {/* Use the date directly from the prop */}
            </p>
          </div>
        </div>

        {/* Billing Information Section */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "40px" }}>
          <div>
            <h2 style={{ fontFamily: "Inter Medium", fontSize: "14pt", fontWeight: "bold", marginBottom: "10px", color: "#333" }}>BILLED TO:</h2>
            <p style={{ fontFamily: "Inter", fontSize: "12pt", color: "#555", margin: "5px 0", whiteSpace: "pre-wrap" }}>
              {clientDetails || "Client details not provided"}
            </p>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
            <div style={{ textAlign: "left" }}>
              {/* Optional: Payment Information */}
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontFamily: "Inter", fontSize: "12pt", color: "#555" }}>White Branding</p>
              <p style={{ fontFamily: "Inter", fontSize: "12pt", color: "#555" }}>Thrissur, Kerala</p>
              <p style={{ fontFamily: "Inter", fontSize: "12pt", color: "#555" }}>8606602888</p>
              <p style={{ fontFamily: "Inter", fontSize: "12pt", color: "#555" }}>whitebranding0@gmail.com</p>
            </div>
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

        {/* Thank You Message */}
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <p style={{ fontFamily: "RoxboroughCF", fontSize: "14pt", fontStyle: "italic", color: "#333" }}>Thank you!</p>
        </div>
      </div>
    );
  }
}

export default PrintUI;
