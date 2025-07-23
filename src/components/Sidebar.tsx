import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, FileText, Upload, MessageSquare, Tag, Heart, Settings, HelpCircle, LogOut, Menu, X } from "lucide-react";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [documentsExpanded, setDocumentsExpanded] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
              <span className="text-white font-medium text-sm">RM</span>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">Ragini Mittal</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">ANALYST</div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 py-6">
          <div className="px-4">
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-4">WORK</div>
            
            {/* Documents Section */}
            <div className="mb-2">
              <button
                onClick={() => setDocumentsExpanded(!documentsExpanded)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="w-4 h-4" />
                  <span>Documents</span>
                </div>
                <ChevronDown 
                  className={`w-4 h-4 transition-transform ${documentsExpanded ? 'rotate-180' : ''}`} 
                />
              </button>
              
              {documentsExpanded && (
                <div className="ml-7 mt-2 space-y-1">
                  <Link to="/documents" className="block px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                    All Documents
                  </Link>
                  <div className="flex items-center justify-between px-3 py-2">
                    <Link to="/upload" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                      Upload
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Bot */}
            <button className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors mb-2">
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-4 h-4" />
                <span>Chat Bot</span>
              </div>
            </button>

            {/* Tags */}
            <button className="w-full flex items-center px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors mb-2">
              <Tag className="w-4 h-4 mr-3" />
              <span>Tags</span>
            </button>

            {/* Support */}
            <button className="w-full flex items-center px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors mb-6">
              <Heart className="w-4 h-4 mr-3" />
              <span>Support</span>
            </button>

            {/* Settings Section */}
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-4">SETTINGS</div>
            
            <button className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors mb-6">
              <div className="flex items-center space-x-3">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </div>
            </button>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <button className="w-full flex items-center px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
            <HelpCircle className="w-4 h-4 mr-3" />
            <span>Help</span>
          </button>
          <Link to="/login" className="w-full flex items-center px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
            <LogOut className="w-4 h-4 mr-3" />
            <span>Go to Login</span>
          </Link>
        </div>
      </div>
    </>
  );
}
