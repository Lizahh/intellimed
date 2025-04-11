import { useState } from "react";
import intellimedLogo from "../../assets/intellimed-logo.jpg";

interface HeaderProps {
  userName?: string;
  statusText: string;
  statusType: "ready" | "recording" | "processing";
}

export default function Header({ userName = "Dr. Sarah Chen", statusText = "Ready", statusType = "ready" }: HeaderProps) {
  const getStatusClasses = () => {
    switch (statusType) {
      case "recording":
        return "bg-red-100 text-status-error";
      case "processing":
        return "bg-blue-100 text-primary";
      case "ready":
      default:
        return "bg-green-100 text-secondary";
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-neutral-100 py-2 px-4 flex justify-between items-center">
      <div className="flex items-center">
        <div className="flex items-center">
          <img src={intellimedLogo} alt="Intellimed AI Logo" className="h-10 mr-3" />
          <div>
            <div className="font-bold text-lg text-[#1e3a5f] leading-tight">Intellimed <span className="text-[#009688]">AI</span></div>
            <div className="text-neutral-500 text-xs">Medical Documentation Assistant</div>
          </div>
        </div>
      </div>
      <div className="flex items-center">
        <span 
          className={`status-indicator text-sm px-3 py-1 rounded-full mr-3 ${getStatusClasses()}`}
        >
          {statusText}
        </span>
        <div className="flex items-center">
          <span className="material-icons text-neutral-500 mr-1">account_circle</span>
          <span className="hidden md:inline text-neutral-700">{userName}</span>
        </div>
      </div>
    </header>
  );
}
