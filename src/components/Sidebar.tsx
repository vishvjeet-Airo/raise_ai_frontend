import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import {
  BarChartHorizontal,
  ChevronDown,
  ChevronLeft,
  HelpCircle,
  LogOut,
  Menu,
  MessageCircle,
  Settings,
  X,
} from "lucide-react";
import { SupportModal } from "./SupportModal";
import { SettingsModal } from "./SettingsModal";

// It's good practice to define props, even if they are empty for now.
// This makes the component easier to extend later.
interface SidebarProps {}

export const Sidebar: React.FC<SidebarProps> = () => {
  const [documentsExpanded, setDocumentsExpanded] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // We add the 'string' type to the 'path' argument.
  const isActive = (path: string): boolean => location.pathname === path;
  const isDocumentsSectionActive = isActive("/documents") || isActive("/upload");

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

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

      {/* Sidebar Container */}
      <div
        className={twMerge(
          `bg-white border-r border-gray-200 flex flex-col h-screen
           fixed lg:relative left-0 top-0 z-50 transform transition-all duration-300 ease-in-out`,
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "w-[88px]" : "w-64", // Corrected width
          "lg:translate-x-0"
        )}
      >
        <div className={twMerge("flex flex-col h-full", isCollapsed ? "items-center" : "")}>

          {/* User Profile Section */}
          <div className={twMerge("p-4 border-b border-gray-200 w-full", isCollapsed ? "px-4" : "px-6")}>
            <div className="flex items-center space-x-3">
              <img src="/analyst.png" alt="Andrew Smith" className="w-10 h-10 rounded-full" />
              {!isCollapsed && (
                <div>
                  <div className="font-medium text-[10px] leading-[12px] tracking-[0.4px] uppercase text-[#757575]">Finance Analyst</div>
                  <div className="font-medium text-sm leading-5 tracking-normal text-black">Andrew Smith</div>
                  
                </div>
              )}
            </div>
          </div>

          {/* Desktop Collapse Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex absolute -right-3 top-8 z-10 w-6 h-6 bg-white border-2 border-gray-200 rounded-full items-center justify-center text-gray-500 hover:bg-gray-100"
          >
            <ChevronLeft className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
          </button>

          {/* Navigation Menu */}
          <div className={twMerge("flex-1 py-6 w-full", isCollapsed ? "px-4" : "px-6")}>
            {!isCollapsed && <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">MAIN</div>}
            
            <ul className="space-y-2">
              {/* Documents Section */}
              <li>
                <button
                  onClick={() => !isCollapsed && setDocumentsExpanded(!documentsExpanded)}
                  className={twMerge(
                    "w-full flex items-center justify-between p-2 rounded-lg transition-colors text-sm font-medium tracking-tightest",
                    isDocumentsSectionActive ? "bg-[#F0F5FF] text-[#052E65]" : "text-[#718096] hover:bg-gray-100",
                    isCollapsed && "justify-center"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <img src="/document.png" alt="Documents" className="w-[14px] h-[18px]" />
                    {!isCollapsed && <span>Documents</span>}
                  </div>
                  {!isCollapsed && (
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${documentsExpanded ? "rotate-180" : ""}`}
                    />
                  )}
                </button>

                {documentsExpanded && !isCollapsed && (
                  <div className="mt-2 pl-4 ml-[10px] border-l-2 border-gray-200 space-y-1">
                    <Link to="/documents" className={twMerge("block p-2 rounded-lg w-full text-xs font-medium tracking-tightest text-[#718096] hover:bg-gray-100", isActive("/documents") && "bg-[#F6F6F6]")}>
                      All Documents
                    </Link>
                    <Link to="/upload" className={twMerge("block p-2 rounded-lg w-full text-xs font-medium tracking-tightest text-[#718096] hover:bg-gray-100", isActive("/upload") && "bg-[#F6F6F6]")}>
                      Upload
                    </Link>
                  </div>
                )}
              </li>
              
              {/* Chat Bot Section */}
              <li>
                <Link
                  to="/chatbot"
                  className={twMerge(
                    "w-full flex items-center gap-3 p-2 rounded-lg text-sm font-medium tracking-tightest",
                    isActive("/chatbot") ? "bg-[#F0F5FF] text-[#052E65]" : "text-[#718096] hover:bg-gray-100",
                    isCollapsed && "justify-center"
                  )}
                >
                  {/* Change w-5 h-5 to w-4 h-4 */}
                  <img src="/chatbot.png" alt="Chat Bot" className="w-[16px] h-[15px]" />
                  {!isCollapsed && <span>Chat Bot</span>}
                </Link>
              </li>

              {/* Action Items Section */}
              <li>
                <Link
                  to="/actionitems"
                  className={twMerge(
                    "w-full flex items-center gap-3 p-2 rounded-lg text-sm font-medium tracking-tightest",
                    isActive("/actionitems") ? "bg-[#F0F5FF] text-[#052E65]" : "text-[#718096] hover:bg-gray-100",
                    isCollapsed && "justify-center"
                  )}
                >
                  {/* Change w-5 h-5 to w-4 h-4 */}
                  <img src="/ActionItem.png" alt="Action Items" className="w-[14px] h-[17px]" />
                  {!isCollapsed && <span>Action Items</span>}
                </Link>
              </li>
            
              {/* Company Profile Section */}
              <li>
                <Link
                  to="/company/create"
                  className={twMerge(
                    "w-full flex items-center gap-3 p-2 rounded-lg text-sm font-medium tracking-tightest",
                    isActive("/company/create") ? "bg-[#F0F5FF] text-[#052E65]" : "text-[#718096] hover:bg-gray-100",
                    isCollapsed && "justify-center"
                  )}
                >
                  {/* Change w-5 h-5 to w-4 h-4 */}
                  <img src="/companyProfile.png" alt="Company Profile" className="w-[14px] h-[17px]" />
                  {!isCollapsed && <span>Company Profile</span>}
                </Link>
              </li>

              {/* Create Uploader Section */}
              <li>
                <Link
                  to="/auth/create-uploader"
                  className={twMerge(
                    "w-full flex items-center gap-3 p-2 rounded-lg text-sm font-medium tracking-tightest",
                    isActive("/auth/create-uploader") ? "bg-[#F0F5FF] text-[#052E65]" : "text-[#718096] hover:bg-gray-100",
                    isCollapsed && "justify-center"
                  )}
                >
                  <img src="/uploader.png" alt="Create Uploader" className="w-[14px] h-[17px]" />
                  {!isCollapsed && <span>Create Uploader</span>}
                </Link>
              </li>
            </ul>
            
            {/* Separator Line */}
            {!isCollapsed && <div className="w-[208px] h-[2px] rounded-full bg-[#F6F6F6] mx-auto my-4" />}

          </div>

          {/* Bottom Section */}
          <div className={twMerge("p-4 w-full", isCollapsed ? "px-2" : "px-6")}>
            {!isCollapsed ? (
              // Expanded view
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => setShowSupportModal(true)}
                    className="flex items-center gap-3 p-2 text-sm font-medium leading-5 tracking-tightest text-[#757575] hover:bg-gray-100 rounded-lg w-full"
                  >
                    <HelpCircle className="w-5 h-5" />
                    <span>Help & Support</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setShowSettingsModal(true)}
                    className="flex items-center gap-3 p-2 text-sm font-medium leading-5 tracking-tightest text-[#757575] hover:bg-gray-100 rounded-lg w-full"
                  >
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                  </button>
                </li>
                <li>
                  <button onClick={handleLogout} className="flex items-center gap-3 p-2 text-sm font-medium leading-5 tracking-tightest text-[#D55F5A] hover:bg-red-50 rounded-lg w-full">
                    <LogOut className="w-5 h-5" />
                    <span>Logout Account</span>
                  </button>
                </li>
              </ul>
            ) : (
              // Collapsed view
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setShowSupportModal(true)}
                    className="flex justify-center p-2 rounded-lg text-[#757575] hover:bg-gray-100 w-full"
                  >
                    <HelpCircle className="w-5 h-5" />
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setShowSettingsModal(true)}
                    className="flex justify-center p-2 rounded-lg text-[#757575] hover:bg-gray-100 w-full"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                </li>
                <li>
                  <button onClick={handleLogout} className="flex justify-center p-2 rounded-lg text-[#D55F5A] hover:bg-red-50 w-full">
                    <LogOut className="w-5 h-5" />
                  </button>
                </li>
              </ul>
            )}
          </div>
        </div>

        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Modals */}
      <SupportModal
        isOpen={showSupportModal}
        onClose={() => setShowSupportModal(false)}
      />
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </>
  );
};
