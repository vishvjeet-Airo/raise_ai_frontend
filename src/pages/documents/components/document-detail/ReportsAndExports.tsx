import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useState } from "react";

interface ReportsAndExportsProps {
  documentTitle?: string;
  documentUrl?: string;
}

export default function ReportsAndExports({ documentTitle, documentUrl }: ReportsAndExportsProps) {
  const [summaryDownloading, setSummaryDownloading] = useState(false);

  function withAttachment(sasUrl: string, fileName: string) {
    try {
      const url = new URL(sasUrl);
      const disposition = `attachment; filename="${fileName}"`;
      url.searchParams.set("response-content-disposition", disposition);
      return url.toString();
    } catch {
      return sasUrl;
    }
  }

  async function forceDownloadViaBlob(sasUrl: string, fileName: string = "document.pdf") {
    try {
      const res = await fetch(sasUrl, { mode: "cors", credentials: "omit" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      window.location.href = withAttachment(sasUrl, fileName);
    }
  }

  /*const handleDownloadOriginal = async () => {
    if (documentUrl) {
      const fileName = (documentTitle || "document") + ".pdf";
      await forceDownloadViaBlob(documentUrl, fileName);
    }
  };*/

  // 🔹 Full-page PDF with html2pdf.js
  const handleDownloadSummary = async () => {
    try {
      setSummaryDownloading(true);

      const html2pdf = (await import("html2pdf.js")).default;

      const element = document.documentElement; // capture full <html>
      const fileName = (documentTitle || "full-page-report") + ".pdf";

      const opt = {
        margin: 0.5,
        filename: fileName,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      };

      await html2pdf().set(opt).from(element).save();
    } catch (e) {
      console.error("Failed to generate PDF:", e);
    } finally {
      setSummaryDownloading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-poppins font-normal">Export Summary Report</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">

          {/* Original Document */}
          {/*<div>
            <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
              ORIGINAL DOCUMENT
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 bg-red-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">PDF</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium">{documentTitle || "Executive Authority"}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="h-7 bg-blue-600 hover:bg-blue-700"
                  onClick={handleDownloadOriginal}
                  disabled={!documentUrl}
                >
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          </div>*/}

          {/* Summary Report */}
          <div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 bg-red-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">PDF</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium">Summary Report</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="h-7 bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
                  onClick={handleDownloadSummary}
                  disabled={summaryDownloading}
                >
                  <Download className="w-3 h-3 mr-1" />
                  {summaryDownloading ? "Preparing..." : "Download"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
