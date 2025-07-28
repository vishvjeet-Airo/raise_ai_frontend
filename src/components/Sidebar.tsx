import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, FileText, Upload, MessageSquare, Tag, Heart, Settings, HelpCircle, LogOut, Menu, X } from "lucide-react";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [documentsExpanded, setDocumentsExpanded] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Helper to check if a route is active
  const isActive = (path: string) => location.pathname === path;
  // Helper to check if any Documents-related route is active
  const isDocumentsSectionActive = isActive("/documents") || isActive("/upload");

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        <Menu className="w-6 h-6 text-gray-600" />
      </button>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        w-64 bg-white border-r border-gray-200 flex flex-col h-screen
        lg:relative lg:translate-x-0
        fixed left-0 top-0 z-50 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${className}
      `}>
        {/* Mobile close button */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        {/* User Profile Section */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">AS</span>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">Andrew Smith</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">ANALYST</div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 py-6">
          <div className="px-4">
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-4">MAIN</div>
            
          {/* Documents Section */}
{/* Documents Section */}
<div className="mb-2">
  <button
    onClick={() => setDocumentsExpanded(!documentsExpanded)}
    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors
      ${isActive("/documents") ? "bg-[#F6F6F6]" : "bg-white"}
    `}
  >
    <div className="flex items-center gap-3">
      <img
        src="/document.png"
        alt="Documents Icon"
        className="w-[13.33px] h-[15px] object-cover"
      />
      <span className="text-[#052E65] font-medium">Documents</span>
    </div>
    <ChevronDown
      className={`w-4 h-4 text-[#718096] transition-transform ${documentsExpanded ? "rotate-180" : ""}`}
    />
  </button>

  {documentsExpanded && (
    <div className="ml-7 mt-2 space-y-1">
      <Link
        to="/documents"
        className={`flex items-center justify-between px-3 py-2 rounded-lg w-full text-[#718096] transition-colors
          ${isActive("/documents") ? "bg-[#F6F6F6]" : "bg-white"}
        `}
      >
        <span className="flex-1">All Documents</span>
      </Link>
      <Link
        to="/upload"
        className={`flex items-center justify-between px-3 py-2 rounded-lg w-full text-[#718096] transition-colors
          ${isActive("/upload") ? "bg-[#F6F6F6]" : "bg-white"}
        `}
      >
        <span className="flex-1">Upload</span>
      </Link>
    </div>
  )}
</div>



          {/* Chat Bot */}
          <Link
            to="/chatbot"
            className={`sidebar-btn w-full flex items-center justify-between mb-2 ${isActive("/chatbot") ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"}`}
          >
            <div className="flex items-center space-x-3">
              <img
                src="/chatbot.png"
                alt="Chat Bot Icon"
                className="w-[13.33px] h-[15px] mt-[2.5px] ml-[3.33px] object-cover"
              />
              <span className={isActive("/chatbot") ? "text-[#052E65] font-medium" : undefined}>Chat Bot</span>
            </div>
          </Link>
           

            
          </div>
        </div>

        {/* Bottom Section */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <button className="w-full flex items-center px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
            <HelpCircle className="w-4 h-4 mr-3" />
            <span>Help</span>
          </button>
          <Link
            to="/login"
            className="w-full flex items-center px-3 py-2 text-sm text-[#D55F5A] rounded-lg hover:bg-gray-50 transition-colors"
          >
        <LogOut className="w-4 h-4 mr-3" />
        <span>Logout Account</span>
</Link>

        </div>
      </div>
    </>
  );
}
