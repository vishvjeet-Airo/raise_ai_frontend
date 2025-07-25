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

    const interval = setInterval(() => {
      setUploadedFiles(prev => prev.map(f => {
        if (f.id === fileId) {
          const newProgress = Math.min(f.progress + Math.random() * 15, 100);
          const uploadedBytes = (file.size * newProgress) / 100;
          
          return {
            ...f,
            progress: newProgress,
            size: formatFileSize(uploadedBytes),
            status: newProgress >= 100 ? 'completed' : 'uploading'
          };
        }
        return f;
      }));
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      setUploadedFiles(prev => prev.map(f => {
        if (f.id === fileId) {
          return {
            ...f,
            progress: 100,
            size: formatFileSize(file.size),
            status: 'completed'
          };
        }
        return f;
      }));
      
      setTimeout(() => {
        setUploadedFiles(prev => {
          const allDone = prev.every(f => f.status === 'completed');
          if (allDone) {
            setIsUploading(false);
            setAllCompleted(true);
          }
          return prev;
        });
      }, 100);
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

    const formData = new FormData();
    let hasFilesToSubmit = false;

    for (const uploadedFile of uploadedFiles) {
      // At this point, only supported PDF files should be in uploadedFiles
      // and their simulation should be completed.
      if (uploadedFile.status === 'completed') {
        formData.append('files', uploadedFile.file);
        hasFilesToSubmit = true;
      } else {
        toast.info(`File ${uploadedFile.file.name} is still processing. Please wait or remove it.`);
      }
    }

    if (!hasFilesToSubmit) {
      toast.info('No completed PDF files found for submission.');
      setAllCompleted(false);
      setUploadedFiles([]);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const responseData = await response.json();
        const results = responseData.results; // Access the nested results array

        if (Array.isArray(results)) {
          let allSuccess = true;
          results.forEach((result: any) => {
            if (result.success) {
              toast.success(`File ${result.filename} uploaded successfully!`);
            } else {
              allSuccess = false;
              toast.error(`Failed to upload ${result.filename}: ${result.detail}`);
            }
          });
          if (allSuccess && results.length > 1) {
            toast.success('All selected PDF files submitted successfully!');
          } else if (results.length === 0) {
            toast.error('No response from server for submitted files.');
          }
        } else {
          console.error('Backend response is not an array:', responseData);
          toast.error('Unexpected response from server. Check console for details.');
        }
      } else {
        console.error('API upload failed:', response.statusText);
        toast.error(`API upload failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error during API upload:', error);
      toast.error('Error during API upload. Check console for details.');
    }

    // Clear the list after submission, regardless of success/failure of individual files
    setAllCompleted(false);
    setUploadedFiles([]);
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
  
      <div className="flex-1 p-8">
        <div className="max-w-4xl">
          {/* Header */}
          <div className="mb-8">
          <h1
              style={{
                font: 'Poppins',
                fontWeight: 500,
                fontStyle: 'normal',
                fontSize: '20px',
                lineHeight: '100%',
                letterSpacing: '0%',
                color: '#4F4F4F', // equivalent to Tailwind's text-gray-900
                marginBottom: '8px' // equivalent to mb-2
              }}
            >
              Upload Document
            </h1>
            <h1
              style={{
                font: 'Inter',
                fontWeight: 500,
                fontStyle: 'medium',
                fontSize: '16px',
                lineHeight: '100%',
                letterSpacing: '0%',
                color: '#A9ACB4'
              }}
            >
              Select and upload the files of your choice
            </h1>
            
          </div>
  
          {/* Upload Area */}
          <div
            className="text-center mb-6 relative transition-colors"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            style={{
              width: '854px',
              height: '350px',
              borderRadius: '26px',
              border: '2px dashed #CBD0DC',
              backgroundColor: dragActive ? '#eff6ff' : '#FFFFFF',
              padding: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderColor: dragActive ? '#3b82f6' : '#CBD0DC',
              backgroundClip: 'padding-box',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".jpeg,.jpg,.png,.pdf,.mp4"
              onChange={handleFileSelect}
              className="hidden"
            />
  
            <div className="flex flex-col items-center">
              <img 
                src="https://cdn.builder.io/api/v1/image/assets%2F853aa9fa4b60476e8ae787cacab84e05%2F602cf35a7f7c4616b61809985a0f38c4?format=webp&width=800"
                alt="Upload icon"
                className="mb-4"
                style={{ width: '66px', height: '66px' }}
              />
              <h3 style={{
                font: 'Inter',
                fontWeight: 500,
                fontSize: '20px',
                lineHeight: '100%',
                letterSpacing: '0%',
                textAlign: 'center',
                color: '#4F4F4F', // text-gray-900 equivalent
                marginBottom: '8px', // mb-2 equivalent (assuming 1 unit = 4px)
              }}>
                Choose a file or drag & drop it here
              </h3>
              <p className="text-gray-500 mb-6 font=Inter">
                PDF format up to 50MB
              </p>
              <button
                onClick={handleBrowseFile}
                className="font-medium transition-colors"
                style={{
                  width: '174px',
                  height: '32.71px',
                  borderRadius: '8px',
                  border: '1px solid #CBD0DC',
                  paddingTop: '16px',
                  paddingRight: '33px',
                  paddingBottom: '16px',
                  paddingLeft: '33px',
                  gap: '10px',
                  backgroundColor: '#FFFFFF',
                  font: 'Poppins',
                  color: '#54575C',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                Browse File
              </button>
            </div>
          </div>

          {/* File Restrictions */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2">Max 3 files 20MB each</p>
            <p className="text-sm text-gray-500">
              <span className="font-medium">Supported format:</span> PDF
            </p>
          </div>

          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-4 mb-8">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-red-600" />
                        <span className="absolute text-xs font-bold text-white bg-red-500 rounded-full w-6 h-4 flex items-center justify-center -mt-2 -mr-2">
                          PDF
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{file.file.name}</p>
                        <p className="text-sm text-gray-500">
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
                      <span className="text-sm text-gray-600">Uploading...</span>
                    </div>
                  )}
                  
                  {file.status === 'completed' && (
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 bg-green-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full w-full"></div>
                      </div>
                      <span className="text-sm text-green-600">Completed</span>
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
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-500 ${
                  isUploading && !allCompleted
                    ? 'opacity-30 cursor-not-allowed bg-blue-300 text-white'
                    : allCompleted
                    ? 'opacity-100 bg-blue-700 text-white hover:bg-blue-800'
                    : 'opacity-0 pointer-events-none bg-blue-600 text-white'
                }`}
              >
                Submit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
