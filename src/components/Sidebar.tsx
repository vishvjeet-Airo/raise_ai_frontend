import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, FileText, Upload, MessageSquare, Tag, Heart, Settings, HelpCircle, LogOut, Menu, X, ChevronLeft, ChevronRight } from "lucide-react";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [documentsExpanded, setDocumentsExpanded] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
      {sidebarOpen && (
        <div className={`
          w-64 bg-white border-r border-gray-200 flex flex-col h-screen
          lg:relative lg:translate-x-0
          fixed left-0 top-0 z-50 transform transition-transform duration-300 ease-in-out
          ${className}
        `}>
          {/* Desktop/Mobile Close Button */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white shadow flex items-center justify-center z-50 border border-gray-200 hover:bg-gray-100"
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>

          {/* User Profile Section */}
          <div className="p-4 border-b" style={{ borderBottom: '1px solid #F6F6F6' }}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">RM</span>
              </div>
              <div>
                <div
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    color: '#757575',
                    fontWeight: 500,
                    fontSize: '10px',
                    lineHeight: '12px',
                    letterSpacing: '0.4px',
                    textTransform: 'uppercase',
                    verticalAlign: 'middle',
                    marginBottom: '2px',
                  }}
                >
                  ANALYST
                </div>
                <div
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    color: '#000000',
                    fontWeight: 500,
                    fontSize: '14px',
                    lineHeight: '20px',
                    letterSpacing: '0px',
                  }}
                >
                  Ragini Mittal
                </div>
              </div>
            </div>
          </div>
          <div
            style={{
              width: '208px',
              height: '2px',
              background: '#F6F6F6',
              borderRadius: '2px',
              opacity: 1,
              margin: '0 auto',
            }}
          />

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
              <span>Logout Account</span>
            </Link>
          </div>
        </div>
      )}

      {/* Sidebar Open Button */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-6 left-2 z-50 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center border border-gray-200 hover:bg-gray-100"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
        >
          <ChevronRight className="w-5 h-5 text-gray-700" />
        </button>
      )}
    </>
  );
}
