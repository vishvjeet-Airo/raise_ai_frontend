import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ClientApp from "../components/ClientApp";
import { Inter, Poppins, Montserrat} from "next/font/google";

const queryClient = new QueryClient();

// 2. Configure the fonts
const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter', // We'll keep using variables as per your tailwind.config
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500"],
  variable: '--font-poppins', // We'll keep using variables
});

// Add Montserrat
const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['500'], // Add the weights you need
  variable: '--font-montserrat',
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
          <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full mx-auto mb-4"></div>
          <h1 className="text-xl font-semibold text-gray-800 mb-2">
            Loading Application...
          </h1>
          <p className="text-gray-600 text-sm">
            Initializing React Router navigation
          </p>
        </div>
      </div>
    );
  }

  return (
    // 3. Apply the font variables to a main wrapper tag
    <main className={`${inter.variable} ${poppins.variable} font-sans`}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          {/* Your ClientApp component will now inherit the fonts */}
          <ClientApp />
        </TooltipProvider>
      </QueryClientProvider>
    </main>
  );
}
