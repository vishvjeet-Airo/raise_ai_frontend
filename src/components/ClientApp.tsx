import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "@/pages/dashboard/Index";
import Login from "@/pages/auth/Login";
import Upload from "@/pages/documents/Upload";
import AllDocuments from "@/pages/documents/AllDocuments";
import DocumentDetail from "@/pages/documents/DocumentDetail";
import NotFound from "@/pages/error/NotFound";

// Router content component
function RouterContent() {
  const location = useLocation();

  useEffect(() => {
    // Log route changes for debugging
    console.log("React Router navigated to:", location.pathname);
  }, [location]);

  return (
    <Routes>
      <Route path="/" element={<AllDocuments />} />
      <Route path="/login" element={<Login />} />
      <Route path="/upload" element={<Upload />} />
      <Route path="/documents" element={<AllDocuments />} />
      <Route path="/documents/:id" element={<DocumentDetail />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

// Client-side app component with React Router
export default function ClientApp() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Ensure the router is ready
    setIsReady(true);
  }, []);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin h-6 w-6 border-b-2 border-blue-600 rounded-full mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Setting up navigation...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <RouterContent />
    </BrowserRouter>
  );
}
