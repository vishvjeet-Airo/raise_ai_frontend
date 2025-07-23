import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Head from "next/head";

const queryClient = new QueryClient();

// Dynamically import the ClientApp to avoid SSR issues
const ClientApp = dynamic(() => import("../components/ClientApp"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">
          Loading Application...
        </h1>
        <p className="text-gray-600">
          Initializing React Router navigation
        </p>
      </div>
    </div>
  ),
});

// Next.js App component wrapper
export default function App({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">
            Loading Application...
          </h1>
          <p className="text-gray-600">
            Initializing React Router navigation
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>RAISE-AI</title>
      </Head>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <ClientApp />
        </TooltipProvider>
      </QueryClientProvider>
    </>
  );
}
