import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Search, ArrowDown, ArrowUp, Eye, Download, X, Loader2, Trash2, AlertTriangle } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import FadedTextLoader from "./components/document-detail/FadedTextLoader";

const getAuthHeaders = (): HeadersInit | undefined => {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : undefined;
};

interface ActionPoint {
  id: number;
  title: string;
  description: string;
  source_page: number;
  deadline: string | null;
}

interface Document {
  id: string;
  name: string;
  publicationDate: string; // "DD/MM/YYYY"
  uploadedAtDate: Date;
  uploaded_at: string;
  status: 'PROCESSED' | 'COMPLETED' | 'PENDING' | 'FAILED' | 'QUEUED' | 'ANALYZED' | 'ANALYZING' | 'IN REVIEW' | 'ESCALATED' | 'VERIFIED' | 'FAILED' | 'ARCHIVED';
  publisher: string;
  url: string; // URL for the document to be viewed
  file_name: string;
  circularType?: string;
  referenceNumber?: string;
  actionPoints?: ActionPoint[];
}

// Helper to force server-side attachment fallback
function withAttachment(sasUrl: string, fileName: string) {
  try {
    const url = new URL(sasUrl);
    const disposition = `attachment; filename="${fileName}"`;
    url.searchParams.set('response-content-disposition', disposition);
    return url.toString();
  } catch {
    return sasUrl;
  }
}

// Force download by fetching as blob first, with server-side fallback
async function forceDownloadViaBlob(sasUrl: string, fileName: string = 'document.pdf') {
  try {
    const res = await fetch(sasUrl, { mode: 'cors', credentials: 'omit' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName; // works because blob: is same-origin
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (e) {
    window.location.href = withAttachment(sasUrl, fileName);
  }
}

// Modal viewer that mirrors the preview behavior from the detail page (iframe with native toolbar)
const DocumentViewerModal = ({ document, onClose }: { document: Document; onClose: () => void; }) => {
  if (!document) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-2xl overflow-hidden w-full max-w-4xl h-[90vh] relative">
          <button
            onClick={onClose}
          className="absolute top-2 right-2 z-10 text-white bg-black/40 hover:bg-black/60 rounded-full p-1"
            aria-label="Close document viewer"
          >
            <X className="w-6 h-6" />
          </button>
            <iframe
          src={document.url}
              title={document.name}
          className="w-full h-full border-0 block"
            />
      </div>
    </div>
  );
};

const DeleteConfirmationDialog = ({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void; }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 font-['Poppins']">
    <div className="bg-white rounded-[10px] shadow-lg w-[394px] h-[190px] flex flex-col items-center justify-center p-8">
      <p className="text-[16px] font-poppins text-[#767575] mb-10 text-center">
        Are you sure you want to delete?
      </p>
      <div className="flex justify-end space-x-6">
        <button 
          onClick={onCancel} 
          className="w-auto px-6 h-[40px] rounded-[8px] border border-[#1F4A75] text-[#1F4A75] bg-white font-normal flex items-center justify-center transition-colors hover:bg-gray-100"
        >
          No
        </button>
        
        <button 
          onClick={onConfirm} 
          className="w-auto px-6 h-[40px] rounded-[8px] bg-[#1F4A75] text-white font-normal flex items-center justify-center transition-colors hover:bg-[#1a3c63]"
        >
          Yes
        </button>
      </div>
    </div>
  </div>
);

const DeleteAllConfirmationDialog = ({ documentCount, onConfirm, onCancel }: { documentCount: number; onConfirm: () => void; onCancel: () => void; }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
      <h2 className="text-lg font-bold mb-4">Delete All Documents</h2>
      <p className="mb-4">
        Are you sure you want to delete all <span className="font-semibold">{documentCount}</span> documents?
        <br />This action cannot be undone.
      </p>
      <div className="flex justify-end space-x-4">
        <button onClick={onCancel} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">Cancel</button>
        <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600">Delete All</button>
      </div>
    </div>
  </div>
);

export default function AllDocuments() {
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [deletingDocument, setDeletingDocument] = useState<Document | null>(null);
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: documents = [], isLoading, isError, error } = useQuery<Document[], Error>({
    queryKey: ["documents"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/documents`,{
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        if (response.status === 401) {
          console.error("Unauthorized request. Logging out.");
          localStorage.removeItem('access_token');
          navigate("/login");
          throw new Error('Unauthorized');
        }
        throw new Error('Failed to fetch documents');
      }
      const data = await response.json();
      return data.map((doc: any) => {
        const publicationDateObj = doc.publication_date ? new Date(doc.publication_date) : null;
        const uploadedAtDateObj = doc.uploaded_at ? new Date(doc.uploaded_at) : null;

        return {
          id: doc.id.toString(),
          name: doc.title || 'No Title',
          publicationDate: publicationDateObj
            ? publicationDateObj.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
            : 'N/A',
          uploaded_at: uploadedAtDateObj
            ? uploadedAtDateObj.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
            : 'N/A',
          uploadedAtDate: uploadedAtDateObj,
          status: doc.status,
          publisher: doc.issuing_authority || 'N/A',
          url: doc.blob_url,
          file_name: doc.file_name,
          circularType: doc.circular_type,
          referenceNumber: doc.reference_number,
          actionPoints: doc.action_points || [],
        };
      });
    }
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

  const deleteAllMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/documents/all-from-db`, {
        method: 'DELETE',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const errorBody = await response.text();
        console.error("Delete all failed with body:", errorBody);
        throw new Error('Failed to delete all documents');
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

  const handleDeleteAll = () => {
    if (documents.length > 0) {
      setShowDeleteAllDialog(true);
    }
  };

  const confirmDeleteAll = () => {
    deleteAllMutation.mutate(undefined, {
      onSettled: () => {
        setShowDeleteAllDialog(false);
      },
    });
  };

  const handleDownload = async (docToDownload: Document) => {
    setDownloading(docToDownload.id);
    try {
      const fileName = docToDownload.file_name || `${docToDownload.name}.pdf`;
      await forceDownloadViaBlob(docToDownload.url, fileName);
    } finally {
      setDownloading(null);
    }
  };

  // NEW: Handler to toggle the sort order for the date column
  const handleDateSortToggle = () => {
    setSortBy(currentSort => (currentSort === 'recent' ? 'oldest' : 'recent'));
  };

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
    if (status === 'PROCESSED' || status === 'COMPLETED') return 'bg-[#2DA1DB] text-white';
    if (status === 'PROCESSING' || status === 'PENDING') return 'bg-yellow-500 text-white';
    return 'bg-red-500 text-white';
  };

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // The existing sorting logic works perfectly with the new toggle handler.
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    // We compare the Date objects directly, no string parsing needed!
    const dateA = a.uploadedAtDate.getTime();
    const dateB = b.uploadedAtDate.getTime();

    if (sortBy === 'oldest') {
      return dateA - dateB; // Ascending for oldest first
    }
    // Default to 'recent'
    return dateB - dateA; // Descending for recent first
  });

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

        <div className="flex-1 p-6 overflow-y-auto mt-0">
          <div className="bg-[#FBFBFB] px-6 py-6 my-6 min-h-[calc(100vh-64px)]">
            <div className="w-full">
              {/* Header, Search, and Actions */}
              <div className="flex items-center mb-8 w-full px-8">
                <h1 className="font-poppins text-base font-medium leading-none tracking-normal text-[#4F4F4F]">
                  All Documents {!isLoading && documents.length > 0 && `(${documents.length})`}
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
                  <button
                    onClick={handleDeleteAll}
                    disabled={documents.length === 0 || deleteAllMutation.isPending}
                    className="h-8 px-3 bg-blue-600 text-white text-sm rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                    title="Delete all documents"
                  >
                    {deleteAllMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    Delete All
                  </button>
                </div>
              </div>

              {/* Documents Table */}
              <div className="bg-white rounded-b-lg border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-[#E5F6F0]">
                    <tr className="h-[43px]">
                      <th className="w-16 px-4 text-center text-xs font-medium text-[#4F4F4F]">S.No.</th>
                      <th className="text-left text-xs font-medium text-[#4F4F4F]">Name</th>

                      <th
                        className="px-8 text-center text-xs font-medium text-[#4F4F4F] cursor-pointer"
                        onClick={handleDateSortToggle}
                      >
                        <div className="flex justify-center items-center whitespace-nowrap">
                          <span>Upload Date</span>
                          {sortBy === 'recent' ? <ArrowDown className="w-4 h-4 ml-1" /> : <ArrowUp className="w-4 h-4 ml-1" />}
                        </div>
                      </th>
                      {/* Removed onClick from Issue Date to avoid conflicting sort controls */}
                      <th className="px-8 text-center text-xs font-medium text-[#4F4F4F]">
                        <div className="flex justify-center items-center whitespace-nowrap">
                          <span>Issue Date</span>
                        </div>
                      </th>
                      
                      <th className="px-8 text-center text-xs font-medium text-[#4F4F4F]">Status</th>
                      <th className="px-8 text-center text-xs font-medium text-[#4F4F4F]">Publisher</th>
                      <th className="px-8 text-center text-xs font-medium text-[#4F4F4F]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {/* This logic checks if there are any documents to display */}
                    {sortedDocuments.length > 0 ? (
                      sortedDocuments.map((document, index) =>{
                        const isProcessed = document.status === 'PROCESSED' || document.status === 'COMPLETED';
                        return (
                        <tr key={document.id} className="hover:bg-gray-50 transition-colors text-xs font-medium text-[#767575]">
                          <td className="px-4 py-4 text-center text-gray-600 font-medium">{index + 1}</td>
                          {/*Name column*/ 
                          }
                          <td className="py-4 max-w-md">
                          {isProcessed ? (
                            <Link
                              to={`/documents/${document.id}`}
                              state={{ document: document }}
                              className="hover:underline"
                            >
                              {document.name}
                            </Link>
                            ) : (
                              <FadedTextLoader lines={1}/>
                            )}
                          </td>
                          <td className="px-8 py-4 text-center">{document.uploaded_at}</td>

                          {/* Issue date column */}
                          <td className="px-8 py-4 text-center">
                          {isProcessed ? document.publicationDate : <FadedTextLoader lines={1} />}
                            </td>
           
                            <td className="px-8 py-4 text-center">
                              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(document.status)}`}>
                                {document.status}
                              </span>
                            </td>

                            <td className="px-8 py-4 text-center">
                              {isProcessed ? document.publisher : <FadedTextLoader lines={1} />}
                            </td>

                            <td className="px-8 py-4">
                              <div className="flex items-center justify-center space-x-3 text-[#1F4A75]">
                                {/* Actions are kept as they are - user might want to delete a pending item */}
                                <button onClick={() => setViewingDocument(document)} className="transition-colors hover:text-blue-700" title="View document"><Eye className="w-4 h-4" /></button>
                                <button onClick={() => handleDelete(document)} className="transition-colors hover:text-red-600" title="Delete document"><Trash2 className="w-4 h-4" /></button>
                                <button onClick={() => handleDownload(document)} className="transition-colors hover:text-blue-700" disabled={downloading === document.id} title="Download document">
                                  {downloading === document.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                </button>
                            </div>
                          </td>
                        </tr>
                      )})
                    ) : (
                      // If NO documents, it shows this "Not Found" message
                      <tr>
                        <td colSpan={8} className="text-center py-10">
                          <p className="mt-4 text-gray-500 font-semibold">No Documents Found!</p>
                        </td>
                      </tr>
                    )}
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
      {showDeleteAllDialog && (
        <DeleteAllConfirmationDialog
          documentCount={documents.length}
          onConfirm={confirmDeleteAll}
          onCancel={() => setShowDeleteAllDialog(false)}
        />
      )}
    </>
  );
}