import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ReportsAndExportsProps {
  documentTitle?: string;
  documentUrl?: string;
}

export default function ReportsAndExports({ documentTitle, documentUrl }: ReportsAndExportsProps) {
  function withAttachment(sasUrl: string, fileName: string) {
    try {
      const url = new URL(sasUrl);
      const disposition = `attachment; filename="${fileName}"`;
      url.searchParams.set('response-content-disposition', disposition);
      return url.toString();
    } catch {
      return sasUrl;
    }
  }

  async function forceDownloadViaBlob(sasUrl: string, fileName: string = 'document.pdf') {
    try {
      const res = await fetch(sasUrl, { mode: 'cors', credentials: 'omit' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
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

  const handleDownloadOriginal = async () => {
    if (documentUrl) {
      const fileName = (documentTitle || 'document') + '.pdf';
      await forceDownloadViaBlob(documentUrl, fileName);
    }
  };

  return (
    <Card>
      <CardHeader>
        {/* Decreased font size from text-lg to text-base */}
        <CardTitle className="text-base">Reports & Exports</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Reduced vertical spacing */}
        <div className="space-y-3">
          {/* Summary Reports Section */}
          <div>
            {/* Decreased heading font size and margin */}
            <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">ORIGINAL DOCUMENT</h4>
            <div className="space-y-2">
              {/* Reduced padding */}
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  {/* Made icon container smaller */}
                  <div className="w-7 h-7 bg-red-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">PDF</span>
                  </div>
                  <div>
                    {/* Decreased font size */}
                    <p className="text-xs font-medium">{documentTitle || "Executive Authority"}</p>
                  </div>
                </div>
                {/* Adjusted button height and icon size */}
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
          </div>

          {/* Detail Reports Section */}
          <div>
            {/* Decreased heading font size and margin */}
            <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">SUMMARY REPORT</h4>
            <div className="space-y-2">
              {/* Reduced padding */}
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                   {/* Made icon container smaller */}
                  <div className="w-7 h-7 bg-red-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">PDF</span>
                  </div>
                  <div>
                    {/* Decreased font size */}
                    <p className="text-xs font-medium">Compliance Obligation</p>
                  </div>
                </div>
                 {/* Adjusted button height and icon size */}
                <Button size="sm" className="h-7 bg-blue-600 hover:bg-blue-700">
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Reduced top margin */}
        <Button className="w-full mt-5 bg-blue-800 hover:bg-blue-900">
          Download All Report ( ZIP )
        </Button>
      </CardContent>
    </Card>
  );
}