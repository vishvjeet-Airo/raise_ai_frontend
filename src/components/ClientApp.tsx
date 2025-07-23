import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "@/pages/dashboard/Index";
import Login from "@/pages/auth/Login";
import Upload from "@/pages/documents/Upload";
import AllDocuments from "@/pages/documents/AllDocuments";
import NotFound from "@/pages/error/NotFound";

// Client-side app component with React Router
export default function ClientApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/documents" element={<AllDocuments />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
