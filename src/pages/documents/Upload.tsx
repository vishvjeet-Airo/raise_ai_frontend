import { API_BASE_URL } from "@/lib/config";
import { useState, useRef, useCallback } from "react";
import { Sidebar } from "@/components/Sidebar";
import { toast } from "sonner";
import { Cloud, X, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const getAuthHeaders = (): HeadersInit | undefined => {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : undefined;
};

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  size: string;
  totalSize: string;
}

// Helper function to create the custom dashed border SVG
const getDashedBorderSVG = (color: string) => {
  const svg = `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="none" rx="0" ry="0" stroke="${color}" stroke-width="3" stroke-dasharray="10, 10" stroke-dashoffset="0" stroke-linecap="round"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
};


export default function Upload() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [allCompleted, setAllCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Initialize the navigate function
  const navigate = useNavigate();

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const supportedFileTypes = ["pdf"];

  const simulateUpload = (file: File) => {
    const fileId = Math.random().toString(36).substr(2, 9);
    const newFile: UploadFile = {
      id: fileId,
      file,
      progress: 0,
      status: 'uploading',
      size: '0 B',
      totalSize: formatFileSize(file.size)
    };

    setUploadedFiles(prev => [...prev, newFile]);
    setIsUploading(true);
    setAllCompleted(false);

    const interval = setInterval(() => {
      setUploadedFiles(prev => prev.map(f => {
        if (f.id === fileId) {
          const newProgress = Math.min(f.progress + Math.random() * 15, 100);
          const uploadedBytes = (file.size * newProgress) / 100;
          
          return {
            ...f,
            progress: newProgress,
            size: formatFileSize(uploadedBytes),
            status: (newProgress >= 100 ? 'completed' : 'uploading') as "uploading" | "completed" | "error"
          };
        }
        return f;
      }));
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      setUploadedFiles(prev => {
        const finalFiles = prev.map(f => {
          if (f.id === fileId) {
            return {
              ...f,
              progress: 100,
              size: formatFileSize(file.size),
              status: 'completed' as "uploading" | "completed" | "error"
            };
          }
          return f;
        });

        const allDone = finalFiles.every(f => f.status === 'completed');
        if (allDone) {
          setIsUploading(false);
          setAllCompleted(true);
        }
        return finalFiles;
      });
    }, 2000 + Math.random() * 2000);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      Array.from(e.dataTransfer.files).forEach(file => {
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        if (fileExtension && supportedFileTypes.includes(fileExtension)) {
          simulateUpload(file);
        } else {
          toast.warning(`Unsupported file type. Only PDF files are allowed.`);
        }
      });
    }
  }, [simulateUpload, supportedFileTypes]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach(file => {
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        if (fileExtension && supportedFileTypes.includes(fileExtension)) {
          simulateUpload(file);
        } else {
          toast.warning(`Unsupported file type. Only PDF files are allowed.`);
        }
      });
    }
  };

  const handleBrowseFile = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleCancel = () => {
    setUploadedFiles([]);
    setIsUploading(false);
    setAllCompleted(false);
  };

  const handleSubmit = async () => {
    if (uploadedFiles.length === 0) {
      toast.info('No files selected for submission.');
      return;
    }

    setIsSubmitting(true);
    toast.info("Submitting files, please wait...");

    const formData = new FormData();
    let hasFilesToSubmit = false;

    for (const uploadedFile of uploadedFiles) {
      if (uploadedFile.status === 'completed') {
        formData.append('files', uploadedFile.file);
        hasFilesToSubmit = true;
      } else {
        toast.info(`File ${uploadedFile.file.name} is still processing. Please wait or remove it.`);
      }
    }

    if (!hasFilesToSubmit) {
      toast.info('No completed PDF files found for submission.');
      setIsSubmitting(false); // Reset submitting state
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/documents/upload`, {
        method: 'POST',
        body: formData,
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const responseData = await response.json();
        const results = responseData.results;

        if (Array.isArray(results)) {
          let allSuccess = true;
          let anyFileSucceeded = false; // Track if at least one file succeeds

          results.forEach((result: any) => {
            if (result.success) {
              toast.success(`File ${result.filename} uploaded successfully!`);
              anyFileSucceeded = true; // Mark that a success occurred
            } else {
              allSuccess = false;
              toast.error(`Failed to upload ${result.filename}: ${result.detail}`);
            }
          });

          if (allSuccess && results.length > 1) {
            toast.success('All selected PDF files submitted successfully!');
          }

          // If any file was uploaded successfully, redirect after a short delay.
          if (anyFileSucceeded) {
            setTimeout(() => {
              navigate('/documents'); // Navigate to the All Documents page
            }, 2500); 
            return;
          }

        } else {
          console.error('Backend response is not an array:', responseData);
          toast.error('Unexpected response from server. Check console for details.');
        }
      } else {
        console.error('API upload failed:', response.statusText);
        toast.error(`API upload failed`);
      }
    } catch (error) {
      console.error('Error during API upload:', error);
      toast.error('Error during API upload. Check console for details.');
    }
    finally {
      setIsSubmitting(false);
    }

    // This code will now only run if no files were successfully uploaded
    setAllCompleted(false);
    setUploadedFiles([]);
  };

  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
  
      <div className="flex-1 p-6 overflow-y-auto mt-0">
        <div className="bg-[#FBFBFB] p-8 min-h-full">
            <div className="max-w-4xl">
              {/* Header */}
              <div className="mb-8">
                <h1 className="font-poppins text-xl font-medium leading-none text-[#4F4F4F] mb-2">
                  Upload Document
                </h1>
                <p className="font-sans text-base font-medium leading-none text-[#A9ACB4]">
                  Select and upload the files of your choice
                </p>
              </div>
    
              {/* Upload Area */}
              <div
                className="relative flex flex-col items-center justify-center w-full min-h-[350px] p-12 text-center bg-white transition-colors duration-300"
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrop}
                style={{
                  backgroundImage: getDashedBorderSVG(dragActive ? '#3b82f6' : '#CBD0DC'),
                  backgroundRepeat: 'no-repeat',
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={supportedFileTypes.map(t => `.${t}`).join(',')}
                  onChange={handleFileSelect}
                  className="hidden"
                />
    
                <img 
                  src="/upload.png" 
                  alt="Upload icon" 
                  className="w-16 h-16 mb-4" 
                />
                
                <h3 className="text-xl font-medium text-[#4F4F4F] mb-2">
                  Choose a file or drag & drop it here
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  PDF format up to 50MB
                </p>
                <button
                  onClick={handleBrowseFile}
                  className="px-8 py-2 text-sm font-poppins text-[#54575C] bg-white border border-[#CBD0DC] rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Browse File
                </button>
              </div>

              {/* File Restrictions */}
              <div className="mt-6 text-sm">
                <p className="text-gray-600 mb-2">Max 3 files 20MB each</p>
                <p className="text-gray-500">
                  <span className="font-medium">Supported format:</span> PDF
                </p>
              </div>

              {/* Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-4 my-8">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <img 
                            src="/documentupload.png"
                            alt="File type icon" 
                            className="w-10 h-10"
                          />
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{file.file.name}</p>
                            <p className="text-xs text-gray-500">
                              {file.size} of {file.totalSize}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(file.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      
                      {file.status === 'uploading' && (
                        <div className="flex items-center space-x-3">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${file.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-600">Uploading...</span>
                        </div>
                      )}
                      
                      {file.status === 'completed' && (
                        <div className="flex items-center space-x-3">
                          <div className="flex-1 bg-[#2DA1DB] rounded-full h-2">
                            <div className="bg-[#2DA1DB] h-2 rounded-full w-full"></div>
                          </div>
                          <span className="text-xs text-[#000000]">Completed</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              {(uploadedFiles.length > 0 || isUploading || allCompleted) && (
                <div className="flex space-x-4">
                  <button
                    onClick={handleCancel}
                    disabled={isUploading && !allCompleted}
                    className={`px-4 py-2 border rounded-lg font-medium transition-all duration-500 text-sm ${
                      isUploading && !allCompleted
                        ? 'opacity-50 cursor-not-allowed text-gray-400 bg-gray-100 border-gray-300'
                        : allCompleted
                        ? 'opacity-100 text-[#1F4A75] bg-white border-[#1F4A75] hover:bg-gray-50'
                        : 'opacity-0 pointer-events-none'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={(isUploading && !allCompleted) || isSubmitting}
                    className={`px-4 py-2 rounded-lg font-medium text-white transition-all duration-500 text-sm flex items-center justify-center ${
                        isSubmitting
                            ? 'bg-blue-400 cursor-not-allowed'
                            : (isUploading && !allCompleted)
                                ? 'opacity-50 cursor-not-allowed bg-blue-300'
                                : allCompleted
                                    ? 'opacity-100 bg-[#1F4A75] hover:bg-opacity-90'
                                    : 'opacity-0 pointer-events-none'
                    }`}
                  >
                  {isSubmitting ? (
                        <>
                            <Cloud className="mr-2 h-4 w-4 animate-pulse" />
                            Submitting...
                        </>
                    ) : (
                        'Submit'
                    )}
                  </button>
              </div>
              )}
              
            </div>
        </div>
      </div>
    </div>
  );
}
