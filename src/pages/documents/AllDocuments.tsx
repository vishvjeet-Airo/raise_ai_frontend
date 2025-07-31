import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Search, ChevronDown, Eye, Download, X, Loader2, Trash2 } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

interface Document {
  id: string;
  name: string;
  publicationDate: string; // "DD / MM / YYYY"
  status: 'Processed' | 'COMPLETED' | 'PENDING' | 'FAILED';
  publisher: string;
  url: string; // URL for the document to be viewed
  file_name: string;
}

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


const DeleteConfirmationDialog = ({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void; }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-lg font-bold mb-4">Are you sure?</h2>
      <p className="mb-4">This action cannot be undone.</p>
      <div className="flex justify-end space-x-4">
        <button onClick={onCancel} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">Cancel</button>
        <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600">Delete</button>
      </div>
    </div>
  </div>
);


export default function AllDocuments() {
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent"); // Default sort is 'recent'
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [deletingDocument, setDeletingDocument] = useState<Document | null>(null);
  const sortMenuRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: documents = [], isLoading, isError, error } = useQuery<Document[], Error>({
    queryKey: ["documents"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/documents`);
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      const data = await response.json();
      return data.map((doc: any) => ({
        id: doc.id.toString(),
        name: doc.title || 'No Title',
        publicationDate: new Date(doc.uploaded_at).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
        status: doc.status,
        publisher: (doc.extracted_fields && doc.extracted_fields.issuer) || 'N/A',
        url: doc.blob_url,
        file_name: doc.file_name,
      }));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (fileName: string) => {
      const response = await fetch(`${API_BASE_URL}/api/documents/delete`, {
        method: 'DELETE',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_names: [fileName],
        }),
      });
      if (!response.ok) {
        const errorBody = await response.text();
        console.error("Deletion failed with body:", errorBody);
        throw new Error('Failed to delete document');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });

  const handleDelete = (document: Document) => {
    setDeletingDocument(document);
  };

  const confirmDelete = () => {
    if (deletingDocument) {
      deleteMutation.mutate(deletingDocument.file_name, {
        onSettled: () => {
          setDeletingDocument(null);
        },
      });
    }
  };

  const handleDownload = (docToDownload: Document) => {
    const link = document.createElement('a');
    link.href = docToDownload.url;
    link.download = docToDownload.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  

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
    setSelectedDocuments(checked ? documents.map(doc => doc.id) : []);
    if (!documents || documents.length === 0) {
      setSelectedDocuments([]);
    }
  };

  const handleSelectDocument = (documentId: string, checked: boolean) => {
    setSelectedDocuments(prev => 
      checked ? [...prev, documentId] : prev.filter(id => id !== documentId)
    );
  };

  const getStatusStyle = (status: string) => {
    if (status === 'Processed' || status === 'COMPLETED') return 'bg-[#2DA1DB] text-white';
    if (status === 'Processing' || status === 'PENDING') return 'bg-yellow-500 text-white';
    return 'bg-red-500 text-white';
  };

  // 1. Filter documents based on search term
  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 2. Sort the filtered documents
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    // Helper function to parse 'DD / MM / YYYY' string to a Date object
    const parseDate = (dateString: string): Date => {
      const [day, month, year] = dateString.split('/').map(Number);
      // Month is 0-indexed in JavaScript's Date object (0=Jan, 11=Dec)
      return new Date(year, month - 1, day);
    };

    const dateA = parseDate(a.publicationDate);
    const dateB = parseDate(b.publicationDate);

    if (sortBy === 'oldest') {
      return dateA.getTime() - dateB.getTime(); // Ascending for oldest first
    }
    // Default to 'recent'
    return dateB.getTime() - dateA.getTime(); // Descending for recent first
  });

  const Tick = ({ show }: { show: boolean }) => (
    <span className="inline-block w-5 text-lg text-blue-700 mr-2">
      {show && (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 8.5L7 11.5L12 5.5" stroke="#1F4A75" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      )}
    </span>
  );

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (isError) {
    return <div className="flex justify-center items-center h-screen text-red-500">Error: {error.message}</div>;
  }

  return (
    <>
      <div className="flex h-screen bg-white overflow-hidden">
        <Sidebar />
        
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="bg-[#FBFBFB] rounded-xl py-8">
              <div className="max-w-full">
                {/* Header, Search, and Actions */}
                <div className="flex items-center mb-8 w-full px-8">
                  <h1 className="font-poppins text-base font-medium leading-none tracking-normal text-[#4F4F4F]">
                      All Documents
                  </h1>
                  <div className="flex items-center gap-3 ml-auto">
                    <div className="relative">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[#707070] w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-[300px] h-8 pl-3 pr-9 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#1F4A75] "
                      />
                    </div>
                    <button className="h-8 px-4 border border-[#1F4A75] text-[#1F4A75] bg-white rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors">
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
                            className={`flex items-center align-middle w-full px-4 py-3 text-left font-roboto font-normal text-base leading-6 tracking-wide text-[#4F4F4F] hover:bg-gray-100 rounded-t-lg ${sortBy === "recent" ? "bg-gray-50" : ""}`}
                            onClick={() => { setSortBy("recent"); setSortMenuOpen(false); }}
                          >
                            <Tick show={sortBy === "recent"} />
                            <span>Recent Publication</span>
                          </button>
                          <button
                            className={`flex items-center align-middle w-full px-4 py-3 text-left font-roboto font-normal text-base leading-6 tracking-wide text-[#4F4F4F] hover:bg-gray-100 rounded-t-lg ${sortBy === "recent" ? "bg-gray-50" : ""}`}
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
                <div className="bg-white rounded-b-lg border border-gray-200 overflow-hidden">                  <table className="w-full">
                    <thead className="bg-[#E5F6F0]">
                      <tr className="h-[43px]">
                        <th className="w-12 px-6">
                          <input
                            type="checkbox"
                            checked={selectedDocuments.length === documents.length && documents.length > 0}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </th>
                        <th className="px-8 text-left font-poppins text-xs font-medium text-[#4F4F4F]">Name</th>
                        <th className="px-8 text-center font-poppins text-xs font-medium text-[#4F4F4F] whitespace-nowrap">Publication Date</th>
                        <th className="px-8 text-center font-poppins text-xs font-medium text-[#4F4F4F]">Status</th>
                        <th className="px-8 text-center font-poppins text-xs font-medium text-[#4F4F4F]">Publisher</th>
                        <th className="px-8 text-center font-poppins text-xs font-medium text-[#4F4F4F]">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {/* 3. Map over the newly sorted array */}
                      {sortedDocuments.map((document) => (
                        <tr key={document.id} className="hover:bg-gray-50 transition-colors font-poppins text-xs font-medium text-[#767575]">
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
                              {document.status === 'COMPLETED' ? 'Processed' : document.status}
                          </span>
                          </td>
                          <td className="px-8 py-4 text-center">{document.publisher}</td>
                          <td className="px-8 py-4">
                            <div className="flex items-center justify-center space-x-3 text-[#1F4A75]">
                              <button onClick={() => setViewingDocument(document)} className="transition-colors"><Eye className="w-4 h-4" /></button>
                              <button onClick={() => handleDelete(document)} className="transition-colors"><Trash2 className="w-4 h-4" /></button>
                              <button onClick={() => handleDownload(document)} className="transition-colors" disabled={downloading === document.id}>
                                {downloading === document.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
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
      </div>
      {/* Conditionally render the modal */}
      {viewingDocument && <DocumentViewerModal document={viewingDocument} onClose={() => setViewingDocument(null)} />}
      {deletingDocument && <DeleteConfirmationDialog onConfirm={confirmDelete} onCancel={() => setDeletingDocument(null)} />}
    </>
  );
}