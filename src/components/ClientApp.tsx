import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Outlet, Navigate } from "react-router-dom";
import Index from "@/pages/dashboard/Index";
import Login from "@/pages/auth/Login";
import ForgotPassword from "@/pages/auth/forgot-password";
import ResetPassword from "@/pages/auth/reset-password";
import Upload from "@/pages/documents/Upload";
import AllDocuments from "@/pages/documents/AllDocuments";
import DocumentDetail from "@/pages/documents/DocumentDetail";
import AuditTrail from "@/pages/documents/AuditTrail";
import NotFound from "@/pages/error/NotFound";
import ChatBot from "@/pages/chatbot";
import ActionItems from "@/pages/actionitems";
import CreateUploader from "@/pages/auth/CreateUploader";
import CompanyProfileByIdPage from "@/pages/company/[id]";
import CompanyCreatePage from "@/pages/company/create";



// Custom hook to get the authentication token
const useAuth = () => {
  // Check for the token directly in the hook
  const token = localStorage.getItem('access_token');
  return token;
};

// Protected route component
const ProtectedRoute = () => {
  const token = useAuth();
  const location = useLocation();

  return token ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace />;
};

// Public route component
const PublicRoute = () => {
  const token = useAuth();

  return token ? <Navigate to="/documents" replace /> : <Outlet />;
};


// Router content component
function RouterContent() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Log route changes for debugging
    console.log("React Router navigated to:", location.pathname);

    // Redirect logic for root path
    if (location.pathname === '/') {
      const token = localStorage.getItem('access_token');
      if (token) {
        navigate('/documents', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    }
  }, [location, navigate]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/documents" element={<AllDocuments />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/documents/:id" element={<DocumentDetail />} />
        <Route path="/documents/:id/audit-trail" element={<AuditTrail />} />
        <Route path="/chatbot" element={<ChatBot />} />
        <Route path="/actionitems" element={<ActionItems />} />
        <Route path="/company/create" element={<CompanyCreatePage />} />
        <Route path="/company/:id" element={<CompanyProfileByIdPage />} />
        <Route path="/auth/create-uploader" element={<CreateUploader />} />
      </Route>

      {/* Fallback Route */}
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
