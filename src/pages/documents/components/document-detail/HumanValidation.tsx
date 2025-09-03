import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Mail, ChevronDown } from "lucide-react";
import { useParams } from "react-router-dom";
import { pdf } from "@react-pdf/renderer";
import { PDFDocument } from "./ReportsAndExports";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";

// Verifier from organization profile
interface Verifier {
  id: string | number;
  name: string;
  email: string;
}

export default function HumanValidation() {
  const { id: routeDocId } = useParams<{ id: string }>();
  const documentId = routeDocId ? Number(routeDocId) : undefined;

  const [stakeholderModalOpen, setStakeholderModalOpen] = useState(false);
  const [verifiers, setVerifiers] = useState<Verifier[]>([]);
  const [selectedStakeholders, setSelectedStakeholders] = useState<string[]>([]);
  const [sendingValidation, setSendingValidation] = useState(false);
  const [loadingVerifiers, setLoadingVerifiers] = useState(false);

  // Load verifiers from organization profile
  useEffect(() => {
    const orgId = localStorage.getItem("organisation_id");
    if (!orgId) return;
    let ignore = false;
    const load = async () => {
      try {
        setLoadingVerifiers(true);
        const res = await apiClient.get(`/api/organisations/organization/${orgId}/full`);
        if (!res.ok) throw new Error(`Failed to fetch organization (${res.status})`);
        const data = await res.json();
        const list = (data?.verifiers || data?.validators || []).map((v: any) => ({
          id: v.id,
          name: v.name || v.full_name || "Unnamed",
          email: v.email || v.mail || "",
        })).filter((v: Verifier) => v.email);
        if (!ignore) setVerifiers(list);
      } catch (e) {
        if (!ignore) setVerifiers([]);
      } finally {
        if (!ignore) setLoadingVerifiers(false);
      }
    };
    load();
    return () => { ignore = true; };
  }, []);

  // Handle stakeholder selection toggle
  const handleStakeholderToggle = (stakeholderId: string | number) => {
    const sid = String(stakeholderId);
    setSelectedStakeholders(prev => {
      if (prev.includes(sid)) {
        return prev.filter(id => id !== sid);
      } else {
        return [...prev, sid];
      }
    });
  };

  // Handle select/deselect all verifiers
  const handleSelectAll = () => {
    if (selectedStakeholders.length === verifiers.length) {
      setSelectedStakeholders([]);
    } else {
      setSelectedStakeholders(verifiers.map(s => String(s.id)));
    }
  };

  // Build PDF summary report blob
  const buildSummaryPdf = async (): Promise<{ blob: Blob; title: string }> => {
    if (!documentId) throw new Error("Missing document id");
    const documentRes = await apiClient.get(`/api/documents/${documentId}`);
    if (!documentRes.ok) throw new Error(`Failed to fetch document (${documentRes.status})`);
    const documentData = await documentRes.json();
    const docData = Array.isArray(documentData) ? documentData[0] : documentData;
    if (!docData) throw new Error("Document not found");

    let summary = "Summary not available for this document.";
    try {
      const summaryRes = await apiClient.get(`/api/documents/${documentId}/summary`);
      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        summary = summaryData.overall_summary || summary;
      }
    } catch {}

    let versioningInfo = null;
    try {
      const versioningRes = await apiClient.get(`/api/documents/${documentId}/versioning-info`);
      if (versioningRes.ok) {
        versioningInfo = await versioningRes.json();
      }
    } catch {}

    const rawTitle = docData.title || docData.name || "";
    const fallback = docData.file_name || `Document ${documentId}`;
    const baseTitle = (rawTitle && typeof rawTitle === "string" ? rawTitle : fallback) as string;
    const safeTitle = baseTitle.replace(/\.pdf$/i, "");
    const blob = await pdf(<PDFDocument docData={docData} summary={summary} versioningInfo={versioningInfo} />).toBlob();
    return { blob, title: safeTitle };
  };

  // Handle sending the validation request
  const handleSendValidation = async () => {
    if (!documentId) return;
    if (selectedStakeholders.length === 0) return;

    try {
      setSendingValidation(true);
      const chosen = verifiers.filter(v => selectedStakeholders.includes(String(v.id)));

      const { blob, title } = await buildSummaryPdf();
      const fileName = `${title}.pdf`;
      const file = new File([blob], fileName, { type: "application/pdf" });

      await Promise.all(
        chosen.map(async (v) => {
          const fd = new FormData();
          fd.append("pdf_file", file);
          fd.append("email", v.email);
          fd.append("document_id", String(documentId));
          const res = await apiClient.post(`/api/emails/send-approval-report`, fd);
          if (!res.ok) {
            const txt = await res.text().catch(() => "");
            throw new Error(txt || `Failed to send to ${v.email}`);
          }
        })
      );

      toast.success("Mail sent successfully");
      setStakeholderModalOpen(false);
      setSelectedStakeholders([]);
    } catch (error) {
      console.error("Failed to send validation request:", error);
    } finally {
      setSendingValidation(false);
    }
  };

  return (
    <>
      <Card className="bg-[#FFFFFF]">
        <CardHeader>
          <CardTitle className="font-poppins font-medium text-[16px] leading-[100%] tracking-[0] text-[#3F3F3F]">
            Human Validation Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Button
              className="w-full bg-[#1F4A75] hover:bg-[#1f4a75]/90 flex items-center justify-center gap-2 disabled:opacity-60"
              onClick={() => setStakeholderModalOpen(true)}
              disabled={sendingValidation}
              title="Select verifiers to send report"
            >
              <span className="font-montserrat font-medium text-[14px] leading-[100%] tracking-[0] text-[#FFFFFF]">
                {sendingValidation ? "Sending..." : "Send Validation"}
              </span>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stakeholder Selection Modal */}
      <Dialog open={stakeholderModalOpen} onOpenChange={(v)=>{ setStakeholderModalOpen(v); if (v) setSelectedStakeholders([]); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Verifiers</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Select All Option */}
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border">
              <Checkbox
                id="select-all"
                checked={verifiers.length > 0 && selectedStakeholders.length === verifiers.length}
                onCheckedChange={handleSelectAll}
              />
              <label htmlFor="select-all" className="text-sm font-medium cursor-pointer flex-1">
                Select All ({verifiers.length} total)
              </label>
            </div>

            {/* Individual Stakeholders List */}
            <div className="max-h-60 overflow-y-auto space-y-1 pr-2">
              {(loadingVerifiers ? [] : verifiers).map((stakeholder) => (
                <div
                  key={stakeholder.id}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-md cursor-pointer"
                >
                  <Checkbox
                    id={String(stakeholder.id)}
                    checked={selectedStakeholders.includes(String(stakeholder.id))}
                    onCheckedChange={() => handleStakeholderToggle(String(stakeholder.id))}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{stakeholder.name}</p>
                    <p className="text-xs text-gray-500">{stakeholder.email}</p>
                    {stakeholder.department && (
                      <p className="text-xs text-blue-600 font-semibold">{stakeholder.department}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Selected count */}
            <div className="text-xs text-gray-500 text-center pt-2">
              {selectedStakeholders.length} of {verifiers.length} selected
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setStakeholderModalOpen(false)}
              disabled={sendingValidation}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendValidation}
              disabled={selectedStakeholders.length === 0 || sendingValidation}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Mail className="w-4 h-4 mr-2" />
              {sendingValidation ? "Sending..." : `Send Report to ${selectedStakeholders.length}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
