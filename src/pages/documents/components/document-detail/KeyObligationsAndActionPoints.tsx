import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import FadedTextLoader from "./FadedTextLoader";
import { formatDateShort } from "@/lib/dateUtils";
import { apiClient } from "@/lib/apiClient";
import { useChatSidebar } from "../../DocumentDetail";

interface ActionPoint {
  id: number;
  title: string;
  description?: string;
  source_page?: number;
  deadline?: string | null;
  source_text?: string;
  is_relevant?: boolean;
  relevance_justification?: string;
  assigned_to_name?: string | null;
  assigned_to_department?: string | null;
}

interface KeyObligationsAndActionPointsProps {
  actionPoints?: ActionPoint[];
  loading?: boolean;
  error?: string | null;
  onPageClick?: (pageNumber: number, sourceText?: string) => void;
}

type EditState = {
  isEditing: boolean;
  prompt: string;
  proposed: string | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
};

export default function KeyObligationsAndActionPoints({
  actionPoints = [],
  loading = false,
  error = null,
  onPageClick,
}: KeyObligationsAndActionPointsProps) {
  const [showAll, setShowAll] = useState(false);
  const [relFilter, setRelFilter] = useState<"relevant" | "irrelevant">("relevant");

  const { documentId } = useChatSidebar();

  // Local overrides after accepting changes
  const [overrides, setOverrides] = useState<Record<number, { description?: string; title?: string }>>({});
  const [editStates, setEditStates] = useState<Record<number, EditState>>({});

  // States for the "Add Detailed Task" modal
  const [showAddTaskFor, setShowAddTaskFor] = useState<number | null>(null);
  const [taskText, setTaskText] = useState("");
  const [taskDept, setTaskDept] = useState("");
  const [taskHead, setTaskHead] = useState("");
  const [taskDeadline, setTaskDeadline] = useState<string>("");
  const [taskStatus, setTaskStatus] = useState("");

  const [deletedIds, setDeletedIds] = useState<Set<number>>(new Set());

  // Updated to remove dependency on localAdds
  const allPoints = useMemo(() => {
    return actionPoints.filter((p) => !deletedIds.has(p.id));
  }, [actionPoints, deletedIds]);

  const filteredPoints = useMemo(() => {
    const base = allPoints;
    if (relFilter === "relevant") return base.filter((p) => p.is_relevant === true || p.is_relevant === undefined);
    return base.filter((p) => p.is_relevant === false);
  }, [allPoints, relFilter]);

  const displayedPoints = showAll ? filteredPoints : filteredPoints.slice(0, 3);

  const handlePageClick = (pageNumber: number | undefined, sourceText?: string) => {
    if (pageNumber && onPageClick) {
      onPageClick(pageNumber, sourceText);
    }
  };

  const toggleEdit = (id: number) => {
    setEditStates((prev) => ({
      ...prev,
      [id]: {
        isEditing: !prev[id]?.isEditing,
        prompt: "",
        proposed: null,
        loading: false,
        saving: false,
        error: null,
      },
    }));
  };

  const requestSuggestion = async (id: number) => {
    setEditStates((prev) => ({ ...prev, [id]: { ...prev[id], loading: true, error: null } }));
    try {
      const prompt = editStates[id]?.prompt || "";
      const res = await apiClient.post(`/api/documents/${documentId}/llm-edit`, {
        target: "obligation",
        obligation_id: id,
        field: "description",
        query: prompt,
      });
      if (!res.ok) {
        const msg = await res.text().catch(() => "Failed to get suggestion");
        throw new Error(msg);
      }
      const data = await res.json().catch(() => ({}));
      const text = data.proposed_text || data.text || data.suggestion || "";
      if (!text) throw new Error("Empty suggestion received");
      setEditStates((prev) => ({ ...prev, [id]: { ...prev[id], proposed: text } }));
    } catch (e: any) {
      setEditStates((prev) => ({ ...prev, [id]: { ...prev[id], error: e.message || "Could not generate suggestion" } }));
    } finally {
      setEditStates((prev) => ({ ...prev, [id]: { ...prev[id], loading: false } }));
    }
  };

  const acceptEdit = async (id: number, current: ActionPoint) => {
    const proposed = editStates[id]?.proposed;
    if (!proposed) return;
    setEditStates((prev) => ({ ...prev, [id]: { ...prev[id], saving: true, error: null } }));
    try {
      // Attempt to persist
      const res = await apiClient.patch(`/api/action-points/${id}`, {
        description: proposed,
      });
      if (!res.ok) {
        const msg = await res.text().catch(() => "Failed to save");
        throw new Error(msg);
      }
      setOverrides((prev) => ({ ...prev, [id]: { ...prev[id], description: proposed } }));
      setEditStates((prev) => ({ ...prev, [id]: { ...prev[id], isEditing: false, proposed: null, prompt: "" } }));
    } catch (e: any) {
      setEditStates((prev) => ({ ...prev, [id]: { ...prev[id], error: e.message || "Failed to save changes" } }));
    } finally {
      setEditStates((prev) => ({ ...prev, [id]: { ...prev[id], saving: false } }));
    }
  };

  const cancelEdit = (id: number) => {
    setEditStates((prev) => ({ ...prev, [id]: { ...prev[id], isEditing: false, proposed: null, prompt: "", error: null } }));
  };

  // Updated to remove logic for localAdds
  const deleteObligation = (id: number) => {
    setDeletedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setEditStates((prev) => {
      const { [id]: _omit, ...rest } = prev;
      return rest;
    });
  };

  const getDescription = (p: ActionPoint) => overrides[p.id]?.description ?? p.description;
  const getTitle = (p: ActionPoint) => overrides[p.id]?.title ?? p.title;

  return (
    <>
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-lg font-poppins font-normal flex items-center gap-2">
              Obligations {!loading && filteredPoints.length > 0 && `(${filteredPoints.length})`}
            </CardTitle>
            <div>
              <select
                id="rel-filter"
                value={relFilter}
                onChange={(e) => setRelFilter(e.target.value as typeof relFilter)}
                className="h-8 px-2 rounded-md border border-slate-300 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                aria-label="Filter obligations by relevance"
                disabled={loading}
              >
                <option value="relevant">Relevant</option>
                <option value="irrelevant">Not Relevant</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loading && (
              <>
                <div className="flex items-center gap-2 py-2 text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Loading obligations...</span>
                </div>
                <FadedTextLoader />
              </>
            )}
            {error && (
              <div className="flex items-center py-4">
                <p className="text-sm text-red-600">Error: {error}</p>
              </div>
            )}
            {!loading && !error && filteredPoints.length === 0 && (
              <div className="text-gray-500 text-sm">
                {relFilter === "relevant" ? "No relevant obligations found." : "No not relevant obligations found."}
              </div>
            )}
            {!loading && !error &&
              displayedPoints.map((point, idx) => {
                const metaItems: React.ReactNode[] = [];

                if (typeof point.source_page === "number") {
                  metaItems.push(
                    <button
                      key="page"
                      onClick={() => handlePageClick(point.source_page, point.source_text)}
                      className="relative group cursor-pointer text-blue-600 hover:text-blue-800 hover:underline"
                      title={point.source_text || "Click to view page in document"}
                    >
                      Page: {point.source_page}
                    </button>
                  );
                }

                if (point.deadline) {
                  metaItems.push(
                    <span key="deadline">Deadline: {formatDateShort(point.deadline)}</span>
                  );
                }

                const st = editStates[point.id];

                return (
                  <div key={point.id}>
                    <div className="flex items-start space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-gray-900 mb-1">{getTitle(point)}</h4>
                        </div>
                        {getDescription(point) && (
                          <p className="text-sm text-gray-700 mb-2 justified">{st?.proposed ?? getDescription(point)}</p>
                        )}
                        {metaItems.length > 0 && (
                          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                            {metaItems.map((item, itemIdx) => (
                              <span key={itemIdx}>
                                {item}
                                {itemIdx < metaItems.length - 1 && <span className="mx-1">|</span>}
                              </span>
                            ))}
                          </div>
                        )}


                      </div>
                    </div>
                    {idx !== displayedPoints.length - 1 && <div className="h-[2px] rounded-full bg-[#F6F6F6] mx-auto my-4" />}
                  </div>
                );
              })}

            {!loading && filteredPoints.length > 3 && (
              <div className="pt-2">
                {!showAll ? (
                  <button onClick={() => setShowAll(true)} className="text-blue-600 font-semibold text-sm hover:underline">
                    + Show More ({filteredPoints.length - 3} more)
                  </button>
                ) : (
                  <button onClick={() => setShowAll(false)} className="text-blue-600 font-semibold text-sm hover:underline">
                    - Show Less
                  </button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Dialog for adding a detailed task remains */}
      <Dialog open={showAddTaskFor !== null} onOpenChange={(v) => { if (!v) setShowAddTaskFor(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Detailed Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-600">Detailed Task</label>
              <Textarea rows={3} value={taskText} onChange={(e) => setTaskText(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-600">Department</label>
                <Input value={taskDept} onChange={(e) => setTaskDept(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-gray-600">Department Head</label>
                <Input value={taskHead} onChange={(e) => setTaskHead(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-600">Deadline</label>
                <Input type="date" value={taskDeadline} onChange={(e) => setTaskDeadline(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-gray-600">Status</label>
                <Input placeholder="Pending / In Progress / Done" value={taskStatus} onChange={(e) => setTaskStatus(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setShowAddTaskFor(null)}>Cancel</Button>
              <Button onClick={async () => {
                const apId = showAddTaskFor;
                if (!apId) return;
                const payload = {
                  task: taskText,
                  assigned_to_department: taskDept,
                  assigned_to_name: taskHead,
                  due_date: taskDeadline || undefined,
                  status: taskStatus,
                };
                try {
                  await apiClient.post(`/api/action-points/${apId}/detailed-action-points`, payload).catch(() => {});
                } catch {}
                setShowAddTaskFor(null);
                setTaskText(""); setTaskDept(""); setTaskHead(""); setTaskDeadline(""); setTaskStatus("");
              }}>Add</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
