import React from "react";
import { Sidebar } from "@/components/Sidebar";

export default function ChatBot() {
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-blue-700 mb-2">Chat Bot</h1>
        <p className="text-gray-600">The development is still in progress.</p>
      </div>
    </div>
  );
} 