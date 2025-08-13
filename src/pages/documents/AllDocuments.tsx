import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Search, ArrowDown, ArrowUp, Eye, Download, X, Loader2, Trash2, AlertTriangle } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

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
}

/**
 * A modal component for viewing a PDF document.
 * It fetches the PDF as a blob and creates a local object URL to bypass
 * 'Content-Disposition: attachment' headers, preventing automatic downloads
 * and allowing the PDF to be rendered inline within an iframe.
 * @param {Document} document - The document object containing the URL and name.
 * @param {function} onClose - The function to call when the modal should be closed.
 */
const DocumentViewerModal = ({ document, onClose }: { document: Document; onClose: () => void; }) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // This effect runs when the modal is opened or the document changes.
    if (!document?.url) {
      setError("Document URL is missing.");
      setIsLoading(false);
      return;
    }

    // Reset states for the new document
    setIsLoading(true);
    setError(null);
    setObjectUrl(null);

    let localUrl: string | null = null;

    const fetchPdfAsBlob = async () => {
      try {
        // Fetch the PDF from the blob_url provided by the API.
        const response = await fetch(document.url);
        if (!response.ok) {
          throw new Error(`Failed to fetch PDF file: ${response.status} ${response.statusText}`);
        }
        // Convert the response into a Blob, which is raw file data.
        const blob = await response.blob();
        // Create a temporary, local URL that points to the blob data in memory.
        localUrl = URL.createObjectURL(blob);
        setObjectUrl(localUrl);
      } catch (e: any) {
        console.error("Error fetching PDF for viewing:", e);
        setError("Could not load the document for preview.");
      } finally {
        // We set loading to false here in the success case,
        // but the iframe's onLoad will handle the final visual switch.
      }
    };

    fetchPdfAsBlob();

    // This is a cleanup function. It runs when the modal is closed.
    // It's crucial for revoking the temporary URL to prevent memory leaks.
    return () => {
      if (localUrl) {
        URL.revokeObjectURL(localUrl);
      }
    };
  }, [document]); // Re-run this logic if the document prop changes.

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300"
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white rounded-lg shadow-2xl flex flex-col transform transition-transform duration-300 animate-scale-in overflow-hidden w-full max-w-4xl h-[90vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-3 bg-[#1F4A75] text-white flex-shrink-0">
          <h3 className="font-semibold text-lg truncate px-2" title={document.name}>{document.name}</h3>
          <button
            onClick={onClose}
            className="text-white hover:text-white/80 p-1 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Close document viewer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body with Iframe and Loading/Error states */}
        <div className="flex-1 bg-gray-200 relative">
          {(isLoading || !objectUrl) && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-white">
              <Loader2 className="w-8 h-8 animate-spin text-[#1F4A75]" />
              <span className="ml-3 text-gray-600">Loading document...</span>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white text-red-600">
              <AlertTriangle className="w-10 h-10 mb-2" />
              <p>{error}</p>
            </div>
          )}
          {objectUrl && (
            <iframe
              // Use the local object URL here instead of the direct document.url
              src={`${objectUrl}#toolbar=0&navpanes=0`}
              title={document.name}
              className={`w-full h-full border-0 transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
              // The iframe's onLoad event tells us when the PDF is actually rendered.
              onLoad={() => setIsLoading(false)}
            />
          )}
        </div>
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
  // 'sortBy' state now toggles between 'recent' and 'oldest'
  const [sortBy, setSortBy] = useState("recent");
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [deletingDocument, setDeletingDocument] = useState<Document | null>(null);
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data: documents = [], isLoading, isError, error } = useQuery<Document[], Error>({
    queryKey: ["documents"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/documents`);
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      const data = await response.json();
      // The corrected version
      return data.map((doc: any) => {
        // Check if the date fields from the API are valid before creating Date objects.
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

  const handleDownload = (docToDownload: Document) => {
    const link = document.createElement('a');
    link.href = docToDownload.url;
    link.download = docToDownload.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

        <div className="flex-1 p-6 overflow-y-auto">
          <div className="bg-[#FBFBFB] rounded-xl px-6 py-6 my-6 min-h-[calc(100vh-64px)]">
            <div className="w-full">
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
                      <th className="w-12 px-6">
                      </th>
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
                      sortedDocuments.map((document) => (
                        <tr key={document.id} className="hover:bg-gray-50 transition-colors text-xs font-medium text-[#767575]">
                          <td className="px-6 py-4"></td>
                          <td className="py-4 max-w-md">
                            <Link
                              to={`/documents/${document.id}`}
                              state={{ document: document }}
                              className="hover:underline"
                            >
                              {document.name}
                            </Link>
                          </td>
                          <td className="px-8 py-4 text-center">{document.uploaded_at}</td>
                          <td className="px-8 py-4 text-center">{document.publicationDate}</td>
                          
                          <td className="px-8 py-4 text-center">
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(document.status)}`}>
                              {document.status === 'COMPLETED' ? 'Processed' : document.status}
                            </span>
                          </td>
                          <td className="px-8 py-4 text-center">{document.publisher}</td>
                          <td className="px-8 py-4">
                            <div className="flex items-center justify-center space-x-3 text-[#1F4A75]">
                              <button onClick={() => setViewingDocument(document)} className="transition-colors hover:text-blue-700" title="View document"><Eye className="w-4 h-4" /></button>
                              <button onClick={() => handleDelete(document)} className="transition-colors hover:text-red-600" title="Delete document"><Trash2 className="w-4 h-4" /></button>
                              <button onClick={() => handleDownload(document)} className="transition-colors hover:text-blue-700" disabled={downloading === document.id} title="Download document">
                                {downloading === document.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      // If NO documents, it shows this "Not Found" message
                      <tr>
                        <td colSpan={9} className="text-center py-10">
                          <img src="/Not Found.png" alt="No documents found" className="mx-auto h-40" />
                          <p className="mt-4 text-gray-500 font-semibold">No Documents Found</p>
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