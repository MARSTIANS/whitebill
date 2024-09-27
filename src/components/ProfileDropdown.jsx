import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom"; // For navigation

const ProfileDropdown = ({ user }) => { // Accept user as a prop
  const navigate = useNavigate();

  const handleLogout = () => {
    // Implement logout logic here (e.g., clearing session)
    console.log("Logging out...");
    navigate("/"); // Redirect to the login page
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* Corrected button with visible icon */}
        <Button variant="none" className=" flex items-center justify-center">
          <User className=" text-black hover:text-gray-800" /> {/* Ensuring correct size and color */}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
     
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;
