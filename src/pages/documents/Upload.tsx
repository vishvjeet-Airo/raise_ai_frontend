import { useState, useRef, useCallback } from "react";
import { Sidebar } from "@/components/Sidebar";
import { toast } from "sonner";
import { Cloud, X, FileText } from "lucide-react";

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
  // Set corner radius (rx, ry) to 0 for sharp edges
  const svg = `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="none" rx="0" ry="0" stroke="${color}" stroke-width="3" stroke-dasharray="10, 10" stroke-dashoffset="0" stroke-linecap="round"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
};


export default function Upload() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [allCompleted, setAllCompleted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        if (f.id === fileId && f.status === 'uploading') {
          const newProgress = Math.min(f.progress + Math.random() * 15, 100);
          const uploadedBytes = (file.size * newProgress) / 100;
          const isComplete = newProgress >= 100;
          
          if(isComplete) {
             clearInterval(interval);
          }
          
          return {
            ...f,
            progress: newProgress,
            size: formatFileSize(uploadedBytes),
            status: isComplete ? 'completed' : 'uploading'
          };
        }
        return f;
      }));
    }, 200);

    // Check for completion status after a delay
     setTimeout(() => {
        setUploadedFiles(prev => {
            const allDone = prev.every(f => f.status === 'completed');
            if (allDone) {
                setIsUploading(false);
                setAllCompleted(true);
            }
            return prev;
        });
    }, 2500 + Math.random() * 1000);
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
          toast.warning(`Unsupported file type: .${fileExtension}`);
        }
      });
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach(file => {
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        if (fileExtension && supportedFileTypes.includes(fileExtension)) {
          simulateUpload(file);
        } else {
          toast.warning(`Unsupported file type: .${fileExtension}`);
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
    // ... (Your handleSubmit logic remains the same)
  };

  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
  
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="bg-[#F6F6F6] rounded-xl p-8 h-full">
            <div className="max-w-4xl">
              {/* Header */}
              <div className="mb-8">
                <h1 className="font-poppins text-xl font-medium leading-none tracking-normal text-[#4F4F4F] mb-2">
                  Upload Document
                </h1>
                <p className="font-sans text-sm font-medium leading-none tracking-normal text-gray-400">
                  Select and upload the files of your choice
                </p>
              </div>
    
              {/* Upload Area */}
              <div
                className="relative flex flex-col items-center justify-center w-full min-h-[350px] p-12 text-center bg-white transition-colors duration-300"
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                style={{
                  backgroundImage: getDashedBorderSVG(dragActive ? '#3b82f6' : '#CBD0DC'),
                  backgroundRepeat: 'no-repeat',
                  backgroundColor: dragActive ? '#eff6ff' : '#FFFFFF',
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
    
                {/* === MODIFICATION HERE === */}
                <img 
                  src="/upload.png" 
                  alt="Upload icon" 
                  className="w-16 h-16 mb-4" 
                />
                
                <h3 className="text-xl font-medium text-gray-700 mb-2">
                  Choose a file or drag & drop it here
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  JPEG, PNG, PDG, and MP4 formats, up to 50MB
                </p>
                <button
                  onClick={handleBrowseFile}
                  className="px-8 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Browse File
                </button>
              </div>

              {/* File Restrictions */}
              <div className="mt-6 text-sm">
                <p className="text-gray-600 mb-2">Max 3 files 20MB each</p>
                <p className="text-[#767575]">
                  <span className="font-medium text-gray-600">Supported formats:</span> PDF
                </p>
              </div>

              {/* Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-4 my-8">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="bg-white rounded-lg border border-gray-200 p-4">
                      {/* ... file upload progress UI ... */}
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
                    className={`px-6 py-2 border border-gray-300 rounded-lg font-medium transition-all duration-500 ${
                      isUploading && !allCompleted
                        ? 'opacity-30 cursor-not-allowed text-gray-400 bg-gray-50'
                        : allCompleted
                        ? 'opacity-100 text-gray-900 hover:bg-gray-50 border-gray-400'
                        : 'opacity-0 pointer-events-none'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isUploading && !allCompleted}
                    className={`px-6 py-2 rounded-lg font-medium text-white transition-all duration-500 ${
                      isUploading && !allCompleted
                        ? 'opacity-30 cursor-not-allowed bg-blue-300'
                        : allCompleted
                        ? 'opacity-100 bg-[#1F4A75] hover:bg-opacity-90'
                        : 'opacity-0 pointer-events-none bg-blue-600'
                    }`}
                  >
                    Submit
                  </button>
                </div>
              )}
              
            </div>
        </div>
      </div>
    </div>
  );
}
