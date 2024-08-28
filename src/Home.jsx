import React, { useState, useEffect } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ReceiptText,
  Bell,
  Calendar,
  ReceiptIndianRupee,
  Users,

  AlarmClock,
  CheckCircle // New icon for Attendance
} from "lucide-react";
import Billing from "./components/Billing";
import CalendarSection from "./components/CalendarSection";
import MonthlyExpenses from "./components/MonthlyExpenses/MonthlyExpenses";
import Clients from "./components/Clients";
import Remainders from "./components/Remainders";
import Attendance from "./components/Attendance"; 
import StaffAttendanceDetails from "./components/StaffAttendanceDetails";

const Home = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(isTouch);
  }, []);

  const handleMouseEnter = () => {
    if (!isTouchDevice) setIsCollapsed(false);
  };

  const handleMouseLeave = () => {
    if (!isTouchDevice) setIsCollapsed(true);
  };

  const handleSidebarClick = () => {
    if (isTouchDevice) setIsCollapsed(!isCollapsed);
  };

  const handleOutsideClick = (e) => {
    if (isTouchDevice && isCollapsed === false) {
      const sidebar = document.getElementById("sidebar");
      if (sidebar && !sidebar.contains(e.target)) {
        setIsCollapsed(true);
      }
    }
  };

  useEffect(() => {
    if (isTouchDevice) {
      document.addEventListener("touchstart", handleOutsideClick);
    }
    return () => {
      if (isTouchDevice) {
        document.removeEventListener("touchstart", handleOutsideClick);
      }
    };
  }, [isCollapsed, isTouchDevice]);

  const sidebarVariants = {
    expanded: { width: 180 },
    collapsed: { width: 80 },
  };

  const textVariants = {
    hidden: { opacity: 0, width: 0 },
    visible: { opacity: 1, width: "auto" },
  };

  const transitionSpeed = 0.07;

  const navItems = [
    {
      path: "calendar",
      icon: <Calendar className="w-6 h-6 -ml-1 flex-shrink-0" />,
      label: "Calendar",
    },
    {
      path: "billing",
      icon: <ReceiptText className="w-6 h-6 -ml-1 flex-shrink-0" />,
      label: "Billing",
    },
    {
      path: "monthly-expenses",
      icon: <ReceiptIndianRupee className="w-6 h-6 -ml-1 flex-shrink-0" />,
      label: "Expenses",
    },
    {
      path: "clients",
      icon: <Users className="w-6 h-6 -ml-1 flex-shrink-0" />,
      label: "Clients",
    },
    {
      path: "remainders",
      icon: <AlarmClock className="w-6 h-6 -ml-1 flex-shrink-0" />,
      label: "Remainders",
    },
    {
      path: "attendance",
      icon: <CheckCircle className="w-6 h-6 -ml-1 flex-shrink-0" />, // New Attendance icon
      label: "Attendance",
    },
  ];

  return (
    <div className="flex h-screen">
      <motion.div
        id="sidebar"
        className="h-full bg-white shadow-md flex flex-col justify-between absolute z-20"
        animate={isCollapsed ? "collapsed" : "expanded"}
        variants={sidebarVariants}
        initial="collapsed"
        transition={{ duration: transitionSpeed }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleSidebarClick}
      >
        <Card className="p-4 flex flex-col h-full">
          <nav className="space-y-4">
            {navItems.map((item) => (
              <Button
                key={item.path}
                asChild
                variant="ghost"
                className={`w-full justify-start ${
                  location.pathname === `/home/${item.path}`
                    ? "bg-gray-200"
                    : "hover:bg-gray-100"
                }`}
                onTouchStart={(e) => e.stopPropagation()}
              >
                <Link
                  to={item.path}
                  className="w-full text-left flex items-center space-x-2"
                >
                  {item.icon}
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={textVariants}
                        transition={{ duration: transitionSpeed }}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </Button>
            ))}
          </nav>
        </Card>
      </motion.div>
      <div className="flex-1 p-6 overflow-auto ml-20">
        <Routes>
          <Route path="billing" element={<Billing />} />
          <Route path="calendar" element={<CalendarSection />} />
          <Route path="monthly-expenses" element={<MonthlyExpenses />} />
          <Route path="clients" element={<Clients />} />
          <Route path="remainders" element={<Remainders />} />
          <Route path="attendance" element={<Attendance />} /> 
          <Route path="attendance/:id" element={<StaffAttendanceDetails />} />
        </Routes>
      </div>
    </div>
  );
};

export default Home;
