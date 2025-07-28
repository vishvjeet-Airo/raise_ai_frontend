import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Search, ChevronDown, Eye, Copy, Download } from "lucide-react";
import { useRef } from "react";

interface Document {
  id: string;
  name: string;
  publicationDate: string;
  status: 'Processed';
  publisher: string;
}

// Hardcoded data array - can be replaced with API data later
const documentsData: Document[] = [
  {
    id: "1",
    name: "Master Circular - Guarantees and Co-acceptances",
    publicationDate: "12 / 04 / 2025",
    status: "Processed",
    publisher: "RBI"
  },
  {
    id: "2", 
    name: "Master Circular - Housing Finance",
    publicationDate: "15 / 04 / 2025",
    status: "Processed", 
    publisher: "RBI"
  },
  {
    id: "3",
    name: "Master Circular - Bank Finance to Non-banking Financial Companies (NBFCs)",
    publicationDate: "05 / 04 / 2025",
    status: "Processed",
    publisher: "RBI"
  },
  {
    id: "4",
    name: "Master Circular - Credit facilities to Scheduled Castes (SCs) & Scheduled Tribes (STs)",
    publicationDate: "23 / 04 / 2025",
    status: "Processed",
    publisher: "RBI"
  }
];

export default function AllDocuments() {
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  // Close popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setSortMenuOpen(false);
      }
    }
    if (sortMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sortMenuOpen]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDocuments(documentsData.map(doc => doc.id));
    } else {
      setSelectedDocuments([]);
    }
  };

  const handleSelectDocument = (documentId: string, checked: boolean) => {
    if (checked) {
      setSelectedDocuments(prev => [...prev, documentId]);
    } else {
      setSelectedDocuments(prev => prev.filter(id => id !== documentId));
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Processed':
        return 'bg-[#2DA1DB] text-white';
      default:
        return '';
    }
  };
  

  const filteredDocuments = documentsData.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const Tick = ({ show }: { show: boolean }) => (
    <span className="inline-block w-5 text-lg text-blue-700 mr-2" style={{ minWidth: '1.25rem' }}>
      {show ? (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 8.5L7 11.5L12 5.5" stroke="#1F4A75" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ) : null}
    </span>
  );

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      
      <div className="flex-1 p-8">
        <div className="max-w-full">
          {/* Header, Search, and Actions in a Single Row */}
          <div className="flex items-center mb-8 w-full">
            <h1 className="text-xl font-semibold text-[#4F4F4F] whitespace-nowrap mr-3 flex-shrink-0" style={{ height: 32, lineHeight: '32px' }}>All Documents</h1>
            <div className="flex items-center gap-3 ml-auto">
              <div className="relative" style={{ height: 32, width: 300 }}>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 h-8 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                  style={{ height: 32 }}
                />
              </div>
              <button
                style={{ width: 78, height: 32, borderColor: '#1F4A75', color: '#1F4A75' }}
                className="border bg-white rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center text-sm font-medium"
              >
                Delete All
              </button>
              <div className="relative" style={{ width: 90, height: 32 }}>
                <button
                  style={{ backgroundColor: '#1F4A75', width: 90, height: 32 }}
                  className="flex items-center space-x-2 text-white rounded-[6px] border border-[#1F4A75] transition-colors justify-center text-sm font-medium"
                  onMouseOver={e => (e.currentTarget.style.backgroundColor = '#18375a')}
                  onMouseOut={e => (e.currentTarget.style.backgroundColor = '#1F4A75')}
                  onClick={() => setSortMenuOpen((open) => !open)}
                >
                  <span>Sort By</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                {sortMenuOpen && (
                  <div
                    ref={sortMenuRef}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 z-20"
                  >
                    <button
                      className={`flex items-center w-full px-4 py-3 text-left text-gray-900 text-base font-normal hover:bg-gray-100 rounded-t-lg ${sortBy === "recent" ? "bg-gray-50" : ""}`}
                      onClick={() => { setSortBy("recent"); setSortMenuOpen(false); }}
                    >
                      <Tick show={sortBy === "recent"} />
                      <span>Recent Publication</span>
                    </button>
                    <button
                      className={`flex items-center w-full px-4 py-3 text-left text-gray-900 text-base font-normal hover:bg-gray-100 rounded-b-lg ${sortBy === "oldest" ? "bg-gray-50" : ""}`}
                      onClick={() => { setSortBy("oldest"); setSortMenuOpen(false); }}
                    >
                      <Tick show={sortBy === "oldest"} />
                      <span>Oldest Publication</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Documents Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="border-b border-gray-200" style={{ backgroundColor: '#E5F6F0' }}>
                <tr>
                  <th className="w-12 px-6 py-3 text-left text-xs font-medium text-gray-900">
                    <input
                      type="checkbox"
                      checked={selectedDocuments.length === documentsData.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-8 py-3 text-left text-sm font-medium text-[#767575] whitespace-nowrap">Name</th>
                  <th className="px-8 py-3 text-center text-sm font-medium text-[#767575] whitespace-nowrap">Publication Date</th>
                  <th className="px-8 py-3 text-center text-sm font-medium text-[#767575] whitespace-nowrap">Status</th>
                  <th className="px-8 py-3 text-center text-sm font-medium text-[#767575] whitespace-nowrap">Publisher</th>
                  <th className="px-8 py-3 text-center text-sm font-medium text-[#767575] whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDocuments.map((document) => (
                  <tr key={document.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedDocuments.includes(document.id)}
                        onChange={(e) => handleSelectDocument(document.id, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-8 py-4">
                      <div className="text-sm font-medium max-w-md text-[#767575]">
                        <Link
                          to={`/documents/${document.id}`}
                          className="hover:underline transition-colors"
                          style={{ color: '#767575' }}
                        >
                          {document.name}
                        </Link>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-center whitespace-nowrap">
                      <div className="text-sm text-[#767575] whitespace-nowrap">
                        {document.publicationDate}
                      </div>
                    </td>
                    <td className="px-8 py-4 text-center">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(document.status)}`}>
                        {document.status}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-center">
                      <div className="text-sm text-[#767575]">
                        {document.publisher}
                      </div>
                    </td>
                    <td className="px-8 py-4 text-center">
                      <div className="flex items-center justify-center space-x-3">
                        <button className="transition-colors" style={{ color: '#1F4A75' }}>
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="transition-colors" style={{ color: '#1F4A75' }}>
                          <Copy className="w-4 h-4" />
                        </button>
                        <button className="transition-colors" style={{ color: '#1F4A75' }}>
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
