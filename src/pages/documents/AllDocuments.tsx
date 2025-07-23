import { useState } from "react";
import { Link } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Search, ChevronDown, Eye, Copy, Download } from "lucide-react";

interface Document {
  id: string;
  name: string;
  publicationDate: string;
  status: 'Published' | 'Reviewed' | 'Processing';
  publisher: string;
}

// Hardcoded data array - can be replaced with API data later
const documentsData: Document[] = [
  {
    id: "1",
    name: "Master Circular - Guarantees and Co-acceptances",
    publicationDate: "12 / 04 / 2026",
    status: "Published",
    publisher: "RBI"
  },
  {
    id: "2", 
    name: "Master Circular - Housing Finance",
    publicationDate: "15 / 04 / 2026",
    status: "Published", 
    publisher: "RBI"
  },
  {
    id: "3",
    name: "Master Circular - Bank Finance to Non-banking Financial Companies (NBFCs)",
    publicationDate: "05 / 04 / 2026",
    status: "Reviewed",
    publisher: "RBI"
  },
  {
    id: "4",
    name: "Master Circular - Credit facilities to Scheduled Castes (SCs) & Scheduled Tribes (STs)",
    publicationDate: "23 / 04 / 2026",
    status: "Reviewed",
    publisher: "RBI"
  },
  {
    id: "5",
    name: "Master Circular on Inter-Bank Lending Programme",
    publicationDate: "14 / 04 / 2026",
    status: "Processing",
    publisher: "RBI"
  },
  {
    id: "6",
    name: "Master Circular - Management of Advances - UCPB",
    publicationDate: "08 / 05 / 2026",
    status: "Published",
    publisher: "RBI"
  },
  {
    id: "7",
    name: "Master Circular - Guarantees and Co-acceptances",
    publicationDate: "09 / 04 / 2026",
    status: "Published",
    publisher: "RBI"
  },
  {
    id: "8",
    name: "Master Circular - Credit facilities to Scheduled Castes (SCs) & Scheduled Tribes (STs)",
    publicationDate: "27 / 04 / 2026",
    status: "Processing",
    publisher: "RBI"
  },
  {
    id: "9",
    name: "Master Circular on Inter-Bank Lending Programme",
    publicationDate: "14 / 04 / 2026",
    status: "Published",
    publisher: "RBI"
  },
  {
    id: "10",
    name: "Master Circular - Management of Advances - UCPB",
    publicationDate: "08 / 04 / 2026",
    status: "Reviewed",
    publisher: "RBI"
  },
  {
    id: "11",
    name: "Master Circular - Guarantees and Co-acceptances",
    publicationDate: "09 / 04 / 2026",
    status: "Reviewed",
    publisher: "RBI"
  }
];

export default function AllDocuments() {
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("Date");

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
      case 'Published':
        return 'bg-blue-500 text-white';
      case 'Reviewed':
        return 'bg-green-500 text-white';
      case 'Processing':
        return 'bg-blue-400 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const filteredDocuments = documentsData.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      
      <div className="flex-1 p-8">
        <div className="max-w-full">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">All Documents</h1>
          </div>

          {/* Search and Actions Bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                Delete All
              </button>
              
              <div className="relative">
                <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <span>Sort By</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Documents Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="w-12 px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedDocuments.length === documentsData.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Publication Date</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Publisher</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
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
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium max-w-md">
                        <Link
                          to={`/documents/${document.id}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                        >
                          {document.name}
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {document.publicationDate}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(document.status)}`}>
                        {document.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {document.publisher}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <button className="text-gray-400 hover:text-gray-600 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600 transition-colors">
                          <Copy className="w-4 h-4" />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600 transition-colors">
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
