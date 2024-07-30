import React, { useState } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ReceiptText,
  Bell,
  Calendar,
  DollarSign,
  Menu,
} from "lucide-react";
import Billing from "./components/Billing";
import BillReminders from "./components/BillReminders";
import CalendarSection from "./components/CalendarSection";
import MonthlyExpenses from "./components/MonthlyExpenses";

const HomeComponent = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const sidebarVariants = {
    expanded: { width: 210 },
    collapsed: { width: 80 },
  };

  const tooltipDelay = { enter: 200, leave: 100 };

  return (
    <div className="flex h-screen bg-gray-50">
      <motion.div
        className="h-full bg-white shadow-md flex flex-col justify-between"
        animate={isCollapsed ? "collapsed" : "expanded"}
        variants={sidebarVariants}
        initial="expanded"
        transition={{ duration: 0.3 }}
      >
        <Card className="p-4 flex flex-col h-full">
          <Button
            variant="ghost"
            className="w-full justify-start mb-4"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <Menu className="w-6 h-6 -ml-2 flex-shrink-0" />
          </Button>
          <nav className="space-y-4">
            <TooltipProvider >
              <Tooltip delay={tooltipDelay}>
                <TooltipTrigger asChild>
                  <Button
                    asChild
                    variant="ghost"
                    className={`w-full justify-start ${
                      location.pathname === "/home/billing" ? "bg-gray-200 border-l-4 border-blue-500" : "hover:bg-gray-100"
                    }`}
                  >
                    <Link to="billing" className="w-full text-left flex items-center space-x-2">
                      <ReceiptText className="w-6 h-6 -ml-2 flex-shrink-0" />
                      {!isCollapsed && <span>Billing</span>}
                    </Link>
                  </Button>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right">
                    <p>Billing</p>
                  </TooltipContent>
                )}
              </Tooltip>
              <Tooltip delay={tooltipDelay}>
                <TooltipTrigger asChild>
                  <Button
                    asChild
                    variant="ghost"
                    className={`w-full justify-start ${
                      location.pathname === "/home/bill-reminders" ? "bg-gray-200 border-l-4 border-blue-500" : "hover:bg-gray-100"
                    }`}
                  >
                    <Link to="bill-reminders" className="w-full text-left flex items-center space-x-2">
                      <Bell className="w-6 h-6 -ml-2 flex-shrink-0" />
                      {!isCollapsed && <span>Notifications</span>}
                    </Link>
                  </Button>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right">
                    <p>Notifications</p>
                  </TooltipContent>
                )}
              </Tooltip>
              <Tooltip delay={tooltipDelay}>
                <TooltipTrigger asChild>
                  <Button
                    asChild
                    variant="ghost"
                    className={`w-full justify-start ${
                      location.pathname === "/home/calendar" ? "bg-gray-200 border-l-4 border-blue-500" : "hover:bg-gray-100"
                    }`}
                  >
                    <Link to="calendar" className="w-full text-left flex items-center space-x-2">
                      <Calendar className="w-6 h-6 -ml-2 flex-shrink-0" />
                      {!isCollapsed && <span>Calendar</span>}
                    </Link>
                  </Button>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right">
                    <p>Calendar</p>
                  </TooltipContent>
                )}
              </Tooltip>
              <Tooltip delay={tooltipDelay}>
                <TooltipTrigger asChild>
                  <Button
                    asChild
                    variant="ghost"
                    className={`w-full justify-start ${
                      location.pathname === "/home/monthly-expenses" ? "bg-gray-200 border-l-4  border-blue-500" : "hover:bg-gray-100"
                    }`}
                  >
                    <Link to="monthly-expenses" className="w-full text-left flex items-center space-x-2">
                      <DollarSign className="w-6 h-6 -ml-2 flex-shrink-0" />
                      {!isCollapsed && <span>Expenses</span>}
                    </Link>
                  </Button>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right">
                    <p>Expenses</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </nav>
        </Card>
      </motion.div>
      <div className="flex-1 p-6 overflow-auto">
        <Routes>
          <Route path="billing" element={<Billing />} />
          <Route path="bill-reminders" element={<BillReminders />} />
          <Route path="calendar" element={<CalendarSection />} />
          <Route path="monthly-expenses" element={<MonthlyExpenses />} />
        </Routes>
      </div>
    </div>
  );
};

export default HomeComponent;
