import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Search, ChevronDown, Eye, Copy, Download, X } from "lucide-react";

interface Document {
  id: string;
  name: string;
  publicationDate: string;
  status: 'Processed';
  publisher: string;
  url: string; // URL for the document to be viewed
}

// Sample PDF URL for demo purposes
const samplePdfUrl = "/master-circular.pdf"; 

const documentsData: Document[] = [
  { id: "1", name: "Master Circular - Guarantees and Co-acceptances", publicationDate: "12 / 04 / 2025", status: "Processed", publisher: "RBI", url: samplePdfUrl },
  { id: "2", name: "Master Circular - Housing Finance", publicationDate: "15 / 04 / 2025", status: "Processed", publisher: "RBI", url: samplePdfUrl },
  { id: "3", name: "Master Circular - Bank Finance to Non-banking Financial Companies (NBFCs)", publicationDate: "05 / 04 / 2025", status: "Processed", publisher: "RBI", url: samplePdfUrl },
  { id: "4", name: "Master Circular - Credit facilities to Scheduled Castes (SCs) & Scheduled Tribes (STs)", publicationDate: "23 / 04 / 2025", status: "Processed", publisher: "RBI", url: samplePdfUrl }
];

// Modal component for viewing the document
const DocumentViewerModal = ({ document, onClose }: { document: Document; onClose: () => void; }) => {
  if (!document) return null;

  // Append #toolbar=0 to the URL to hide the default PDF toolbar
  const pdfUrl = `${document.url}#toolbar=0`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
      <div 
        className="bg-white shadow-2xl flex flex-col transform transition-transform duration-300 animate-scale-in overflow-hidden w-[562px] h-[90vh]"
      >
        <div className="flex items-center justify-end p-2 bg-[#1F4A75]">
          <button onClick={onClose} className="text-white hover:text-white/80 p-1 rounded-full hover:bg-white/20 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        {/* Add padding to this container to create the gap */}
        <div className="flex-1 p-4 bg-white">
          <iframe
            src={pdfUrl}
            title={document.name}
            className="w-full h-full border-0"
          />
        </div>
      </div>
    </div>
  );
};


export default function AllDocuments() {
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null); // State for the modal
  const sortMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setSortMenuOpen(false);
      }
    }
    if (sortMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sortMenuOpen]);

  const handleSelectAll = (checked: boolean) => {
    setSelectedDocuments(checked ? documentsData.map(doc => doc.id) : []);
  };

  const handleSelectDocument = (documentId: string, checked: boolean) => {
    setSelectedDocuments(prev => 
      checked ? [...prev, documentId] : prev.filter(id => id !== documentId)
    );
  };

  const getStatusStyle = (status: string) => {
    return status === 'Processed' ? 'bg-[#2DA1DB] text-white' : '';
  };

  const filteredDocuments = documentsData.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const Tick = ({ show }: { show: boolean }) => (
    <span className="inline-block w-5 text-lg text-blue-700 mr-2">
      {show && (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 8.5L7 11.5L12 5.5" stroke="#1F4A75" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      )}
    </span>
  );

  return (
    <>
      <div className="flex h-screen bg-white">
        <Sidebar />
        
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="bg-[#F6F6F6] rounded-xl p-8 h-full">
              <div className="max-w-full">
                {/* Header, Search, and Actions */}
                <div className="flex items-center mb-8 w-full">
                  <h1 className="font-poppins text-base font-medium leading-none tracking-normal text-[#4F4F4F]">
                      All Documents
                  </h1>
                  <div className="flex items-center gap-3 ml-auto">
                    <div className="relative">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-[300px] h-8 pl-3 pr-9 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <button className="h-8 px-4 border border-[#1F4A75] text-[#1F4A75] bg-white rounded-lg hover:bg-red-50 text-sm font-medium transition-colors">
                      Delete All
                    </button>
                    <div className="relative">
                      <button
                        className="h-8 px-4 flex items-center space-x-2 bg-[#1F4A75] text-white rounded-lg hover:bg-[#18375a] text-sm font-medium transition-colors"
                        onClick={() => setSortMenuOpen(open => !open)}
                      >
                        <span>Sort By</span>
                        <ChevronDown className="w-3 h-3" />
                      </button>
                      {sortMenuOpen && (
                        <div ref={sortMenuRef} className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 z-20">
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
                    <thead className="bg-[#E5F6F0]">
                      <tr className="h-[43px]">
                        <th className="w-12 px-6">
                          <input
                            type="checkbox"
                            checked={selectedDocuments.length === documentsData.length && documentsData.length > 0}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </th>
                        <th className="px-8 text-left font-poppins text-xs font-medium text-[#4F4F4F]">Name</th>
                        <th className="px-8 text-center font-poppins text-xs font-medium text-[#4F4F4F]">Publication Date</th>
                        <th className="px-8 text-center font-poppins text-xs font-medium text-[#4F4F4F]">Status</th>
                        <th className="px-8 text-center font-poppins text-xs font-medium text-[#4F4F4F]">Publisher</th>
                        <th className="px-8 text-center font-poppins text-xs font-medium text-[#4F4F4F]">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredDocuments.map((document) => (
                        <tr key={document.id} className="hover:bg-gray-50 transition-colors font-poppins text-xs font-medium text-[#4F4F4F]">
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={selectedDocuments.includes(document.id)}
                              onChange={(e) => handleSelectDocument(document.id, e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-8 py-4 max-w-md">
                            <Link to={`/documents/${document.id}`} className="hover:underline">
                              {document.name}
                            </Link>
                          </td>
                          <td className="px-8 py-4 text-center">{document.publicationDate}</td>
                          <td className="px-8 py-4 text-center">
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(document.status)}`}>
                              {document.status}
                            </span>
                          </td>
                          <td className="px-8 py-4 text-center">{document.publisher}</td>
                          <td className="px-8 py-4">
                            <div className="flex items-center justify-center space-x-3 text-[#1F4A75]">
                              <button onClick={() => setViewingDocument(document)} className="transition-colors"><Eye className="w-4 h-4" /></button>
                              <button className="transition-colors"><Copy className="w-4 h-4" /></button>
                              <button className="transition-colors"><Download className="w-4 h-4" /></button>
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
      </div>
      {/* Conditionally render the modal */}
      {viewingDocument && <DocumentViewerModal document={viewingDocument} onClose={() => setViewingDocument(null)} />}
    </>
  );
}
