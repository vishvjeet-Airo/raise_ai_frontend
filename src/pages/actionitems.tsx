import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Search, ArrowUp, ArrowDown, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/lib/apiClient";

type ApiDetailedActionPoint = {
  id: number;
  task?: string | null;
  due_date?: string | null;
  assigned_to_name?: string | null;
  assigned_to_department?: string | null;
  status?: string | null;
};

type ApiActionPoint = {
  id: number;
  title?: string | null;
  description?: string | null;
  source_page?: number | null;
  deadline?: string | null;
  is_relevant?: boolean; // used to filter
  assigned_to_name?: string | null;
  assigned_to_department?: string | null;
  detailed_action_points?: ApiDetailedActionPoint[] | null;
};

type ApiDocument = {
  id: number;
  title?: string | null;
  issuing_authority?: string | null;
  publication_date?: string | null;
  action_points?: ApiActionPoint[] | null;
};

type DetailedActionItem = {
  id: string;
  task: string;
  person: string;
  department: string;
  deadline: Date | null;
  status: string;
};

type ActionItem = {
  id: number;
  title: string;
  description?: string;
  source_page?: number;
  deadline: Date | null;
  assigned_to_name?: string;
  assigned_to_department?: string;
  detailed_action_points: DetailedActionItem[];
};

type DocGroup = {
  documentId: number;
  documentTitle: string;
  actionItems: ActionItem[];
};



/* ---- helpers ---- */
const ns = "Not Specified";
const toTitle = (s: string) => s.slice(0, 1).toUpperCase() + s.slice(1);

function getStatusClasses(status: string) {
  const v = status.toLowerCase();
  if (v.includes("complete") || v === "done") return "bg-emerald-100 text-emerald-700";
  if (v.includes("progress")) return "bg-blue-100 text-blue-700";
  if (v.includes("overdue") || v.includes("late")) return "bg-rose-100 text-rose-700";
  if (v.includes("pending")) return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-700";
}

export default function ActionItemsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [sortConfig, setSortConfig] = useState<{ key: "deadline"; direction: "asc" | "desc" } | null>({
    key: "deadline",
    direction: "asc",
  });

  const [groups, setGroups] = useState<DocGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [editActionItem, setEditActionItem] = useState<{ groupId: number; actionItemId: number } | null>(null);
  const [addDetailedFor, setAddDetailedFor] = useState<{ groupId: number; actionItemId: number } | null>(null);
  const [deleteActionItem, setDeleteActionItem] = useState<{ groupId: number; actionItemId: number } | null>(null);
  const [editDetailedFor, setEditDetailedFor] = useState<{ groupId: number; actionItemId: number; detailedId: string } | null>(null);

  // Form state for editing action item
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formPage, setFormPage] = useState<string>("");
  const [formDeadline, setFormDeadline] = useState<string>("");

  // Form state for adding/editing detailed task
  const [taskText, setTaskText] = useState("");
  const [taskDept, setTaskDept] = useState("");
  const [taskDeadline, setTaskDeadline] = useState<string>("");
  const [taskStatus, setTaskStatus] = useState("");

  // Fetch documents and structure action points with their detailed action points
  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiClient.get("/api/documents", {
          headers: {
            accept: "application/json",
          },
        });
        if (!res.ok) throw new Error(`Failed to fetch (${res.status})`);
        const data: ApiDocument[] = await res.json();

        const mapped: DocGroup[] = (data || []).map((doc) => {
          const actionItems: ActionItem[] = [];

          // Only include action points with is_relevant === true
          (doc.action_points || [])
            .filter((ap) => ap.is_relevant === true)
            .forEach((ap) => {
              const detailedActionPoints: DetailedActionItem[] = [];
              
              (ap.detailed_action_points || []).forEach((dap) => {
                const taskText = (dap.task && dap.task.trim()) || ns;
                const person = (dap.assigned_to_name && dap.assigned_to_name.trim()) || ns;
                const department = (dap.assigned_to_department && dap.assigned_to_department.trim()) || ns;

                // prefer detailed due_date; fall back to action_point deadline
                const rawDate = dap.due_date || ap.deadline || null;
                const deadline = rawDate ? new Date(rawDate) : null;
                const status = (dap.status && dap.status.trim()) || ns;

                detailedActionPoints.push({
                  id: `dap-${dap.id}`,
                  task: taskText,
                  person,
                  department,
                  deadline: deadline && !isNaN(deadline.getTime()) ? deadline : null,
                  status,
                });
              });

              const actionItemDeadline = ap.deadline ? new Date(ap.deadline) : null;
              
              actionItems.push({
                id: ap.id,
                title: ap.title || `Action Item ${ap.id}`,
                description: ap.description || undefined,
                source_page: ap.source_page || undefined,
                deadline: actionItemDeadline && !isNaN(actionItemDeadline.getTime()) ? actionItemDeadline : null,
                assigned_to_name: ap.assigned_to_name || undefined,
                assigned_to_department: ap.assigned_to_department || undefined,
                detailed_action_points: detailedActionPoints,
              });
            });

          return {
            documentId: doc.id,
            documentTitle: doc.title || `Document ${doc.id}`,
            actionItems: actionItems.filter(ai => ai.detailed_action_points.length > 0),
          };
        });

        // Seed one hardcoded detailed task example (demo)
        if (mapped.length && mapped[0].actionItems.length) {
          const first = mapped[0].actionItems[0];
          first.detailed_action_points = [
            {
              id: `demo-${Date.now()}`,
              task: "",
              person: "",
              department: "",
              deadline: new Date(),
              status: "",
            },
            ...first.detailed_action_points,
          ];
        }

        if (!ignore) setGroups(mapped);
      } catch (e: any) {
        if (!ignore) setError(e?.message || "Something went wrong.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, []);

  // Build department options dynamically from data
  const departmentOptions = useMemo(() => {
    const set = new Set<string>();
    groups.forEach((g) => 
      g.actionItems.forEach((ai) => 
        ai.detailed_action_points.forEach((dap) => 
          dap.department && set.add(dap.department)
        )
      )
    );
    return ["All", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [groups]);

  // Apply search, filter, and sort per document group
  const filteredAndSortedGroups = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const dir = sortConfig?.direction || "asc";

    const cmpDeadline = (a: DetailedActionItem, b: DetailedActionItem) => {
      // nulls last for asc, first for desc
      if (!a.deadline && !b.deadline) return 0;
      if (!a.deadline) return dir === "asc" ? 1 : -1;
      if (!b.deadline) return dir === "asc" ? -1 : 1;
      return a.deadline.getTime() - b.deadline.getTime();
    };

    return groups
      .map((g) => {
        let actionItems = [...g.actionItems];

        // Filter action items based on search term
        if (term) {
          actionItems = actionItems.filter((ai) => {
            // Check if action item title/description matches
            const titleMatch = ai.title.toLowerCase().includes(term);
            const descMatch = ai.description?.toLowerCase().includes(term);
            
            // Check if any detailed action point matches
            const detailedMatch = ai.detailed_action_points.some((dap) =>
              dap.task.toLowerCase().includes(term) ||
              dap.person.toLowerCase().includes(term) ||
              dap.department.toLowerCase().includes(term) ||
              dap.status.toLowerCase().includes(term)
            );

            return titleMatch || descMatch || detailedMatch;
          });
        }

        // Filter detailed action points based on department
        if (departmentFilter !== "All") {
          actionItems = actionItems.map((ai) => ({
            ...ai,
            detailed_action_points: ai.detailed_action_points.filter((dap) => 
              dap.department === departmentFilter
            )
          })).filter((ai) => ai.detailed_action_points.length > 0);
        }

        // Sort detailed action points by deadline
        if (sortConfig?.key === "deadline") {
          actionItems = actionItems.map((ai) => ({
            ...ai,
            detailed_action_points: [...ai.detailed_action_points].sort(cmpDeadline)
          }));
        }

        return { ...g, actionItems };
      })
      .filter((g) => g.actionItems.length > 0);
  }, [groups, searchTerm, departmentFilter, sortConfig]);

  const handleSort = (key: "deadline") => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const openEdit = (groupId: number, actionItemId: number, ai: ActionItem) => {
    setEditActionItem({ groupId, actionItemId });
    setFormTitle(ai.title);
    setFormDesc(ai.description || "");
    setFormPage(ai.source_page ? String(ai.source_page) : "");
    setFormDeadline(ai.deadline ? ai.deadline.toISOString().slice(0, 10) : "");
  };

  const applyEdit = () => {
    if (!editActionItem) return;
    setGroups((prev) => prev.map((g) => {
      if (g.documentId !== editActionItem.groupId) return g;
      return {
        ...g,
        actionItems: g.actionItems.map((ai) => ai.id === editActionItem.actionItemId ? {
          ...ai,
          title: formTitle || ai.title,
          description: formDesc || undefined,
          source_page: formPage ? Number(formPage) : undefined,
          deadline: formDeadline ? new Date(formDeadline) : null,
        } : ai),
      };
    }));
    setEditActionItem(null);
  };

  const openAddDetailed = (groupId: number, actionItemId: number) => {
    setAddDetailedFor({ groupId, actionItemId });
    setTaskText("");
    setTaskDept("");
    setTaskDeadline("");
    setTaskStatus("");
  };

  const applyAddDetailed = () => {
    if (!addDetailedFor) return;
    setGroups((prev) => prev.map((g) => {
      if (g.documentId !== addDetailedFor.groupId) return g;
      return {
        ...g,
        actionItems: g.actionItems.map((ai) => ai.id === addDetailedFor.actionItemId ? {
          ...ai,
          detailed_action_points: [
            {
              id: `local-${Date.now()}`,
              task: taskText || "New Task",
              department: taskDept || ns,
              person: ns,
              deadline: taskDeadline ? new Date(taskDeadline) : null,
              status: taskStatus || "Pending",
            },
            ...ai.detailed_action_points,
          ],
        } : ai),
      };
    }));
    setAddDetailedFor(null);
  };

  const openEditDetailed = (groupId: number, actionItemId: number, item: DetailedActionItem) => {
    setEditDetailedFor({ groupId, actionItemId, detailedId: item.id });
    setTaskText(item.task);
    setTaskDept(item.department);
    setTaskDeadline(item.deadline ? item.deadline.toISOString().slice(0, 10) : "");
    setTaskStatus(item.status);
  };

  const applyEditDetailed = () => {
    if (!editDetailedFor) return;
    setGroups((prev) => prev.map((g) => {
      if (g.documentId !== editDetailedFor.groupId) return g;
      return {
        ...g,
        actionItems: g.actionItems.map((ai) => ai.id === editDetailedFor.actionItemId ? {
          ...ai,
          detailed_action_points: ai.detailed_action_points.map((d) => d.id === editDetailedFor.detailedId ? {
            ...d,
            task: taskText || d.task,
            department: taskDept || d.department,
            deadline: taskDeadline ? new Date(taskDeadline) : null,
            status: taskStatus || d.status,
          } : d),
        } : ai),
      };
    }));
    setEditDetailedFor(null);
  };

  const openDelete = (groupId: number, actionItemId: number) => setDeleteActionItem({ groupId, actionItemId });
  const applyDelete = () => {
    if (!deleteActionItem) return;
    setGroups((prev) => prev.map((g) => {
      if (g.documentId !== deleteActionItem.groupId) return g;
      return { ...g, actionItems: g.actionItems.filter((ai) => ai.id !== deleteActionItem.actionItemId) };
    }));
    setDeleteActionItem(null);
  };

  const removeDetailed = (groupId: number, actionItemId: number, detailedId: string) => {
    setGroups((prev) => prev.map((g) => {
      if (g.documentId !== groupId) return g;
      return {
        ...g,
        actionItems: g.actionItems.map((ai) => ai.id === actionItemId ? {
          ...ai,
          detailed_action_points: ai.detailed_action_points.filter((d) => d.id !== detailedId),
        } : ai),
      };
    }));
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-semibold text-slate-900">Action Items</h1>
          </div>

          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-11 pl-10 pr-4 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="h-11 px-4 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
            >
              {departmentOptions.map((dep) => (
                <option key={dep} value={dep}>
                  {dep === "All" ? "All Departments" : dep}
                </option>
              ))}
            </select>
          </div>

          {loading && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8 text-center text-slate-500">
              Loading action items...
            </div>
          )}
          {error && (
            <div className="bg-white border border-rose-200 rounded-xl shadow-sm p-8 text-center text-rose-600">
              {error}
            </div>
          )}

          {!loading && !error && filteredAndSortedGroups.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8 text-center text-slate-500">
              No action items found.
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-12">
              {filteredAndSortedGroups.map((group) => (
                <section key={group.documentId}>
                  {/* Group Header: Clickable title */}
                  <div className="flex items-center justify-between mb-6">
                    <Link
                      to={`/documents/${group.documentId}`}
                      className="text-xl font-semibold text-white bg-[#0F2353] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-lg px-4 py-2 transition-colors"
                      title="Open document details"
                    >
                      {group.documentTitle} (ID: {group.documentId})
                    </Link>
                  </div>

                  {/* Action Items */}
                  <div className="space-y-6">
                    {group.actionItems.map((actionItem) => (
                      <div key={actionItem.id} className="bg-white/95 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        {/* Action Item Header */}
                        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 rounded-t-xl">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center justify-between gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-slate-900 ">{actionItem.title}</h3>
                                <Button 
                                  size="sm" 
                                  className="bg-blue-700 text-white hover:bg-blue-800" 
                                  onClick={() => openAddDetailed(group.documentId, actionItem.id)}
                                >
                                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Detailed Task
                                </Button>
                              </div>
                              {actionItem.description && (
                                <p className="text-sm text-slate-600 mb-2">
                                  {actionItem.description}
                                </p>
                              )}
                              <div className="flex items-center gap-4 text-xs text-slate-500">
                                {actionItem.source_page && (
                                  <span>Page: {actionItem.source_page}</span>
                                )}
                                {actionItem.deadline && (
                                  <span>Deadline: {actionItem.deadline.toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })}</span>
                                )}
                                {actionItem.assigned_to_name && (
                                  <span>Assigned: {actionItem.assigned_to_name}</span>
                                )}
                                {actionItem.assigned_to_department && (
                                  <span>Department: {actionItem.assigned_to_department}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Detailed Action Points Table */}
                        {actionItem.detailed_action_points.length > 0 ? (
                          <div className="overflow-x-auto overflow-y-hidden rounded-b-xl">
                            <table className="w-full table-auto text-sm text-left text-slate-700">
                              <colgroup>
                                <col style={{ width: "40%" }} />
                                <col style={{ width: "20%" }} />
                                <col style={{ width: "20%" }} />
                                <col style={{ width: "10%" }} />
                                <col style={{ width: "10%" }} />
                              </colgroup>
                              <thead className="bg-slate-50 text-xs text-slate-600">
                                <tr className="border-b border-slate-200">
                                  <th scope="col" className="px-6 py-3 font-semibold text-left">Detailed Tasks</th>
                                  <th scope="col" className="px-6 py-3 font-semibold text-left">Department</th>
                                  <th scope="col" className="px-6 py-3 font-semibold text-left whitespace-nowrap">Department Head</th>
                                  <th scope="col" className="px-6 py-3 font-semibold text-center">
                                    <button
                                      onClick={() => handleSort("deadline")}
                                      className="inline-flex items-center gap-1.5 hover:text-slate-800"
                                    >
                                      Deadline
                                      {sortConfig?.key === "deadline" ? (
                                        sortConfig.direction === "asc" ? (
                                          <ArrowUp className="w-4 h-4" />
                                        ) : (
                                          <ArrowDown className="w-4 h-4" />
                                        )
                                      ) : (
                                        <ArrowUp className="w-4 h-4 text-slate-400" />
                                      )}
                                    </button>
                                  </th>
                                  <th scope="col" className="px-6 py-3 font-semibold text-center">Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {actionItem.detailed_action_points.map((item, idx) => (
                                  <tr
                                    key={item.id}
                                    className={`border-b border-slate-100 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"} hover:bg-slate-50`}
                                  >
                                    <td className="px-6 py-4 align-middle">
                                        <div className="whitespace-pre-wrap break-words flex-1">{item.task || ns}</div>
                                        <div className="mt-2 flex gap-2">
                                        <Button variant="ghost" size="icon" className="h-6 w-6 p-0 text-slate-600 hover:bg-transparent" title="Edit detailed task" onClick={() => openEditDetailed(group.documentId, actionItem.id, item.id)}>
                                        <Pencil className="w-4 h-4" />
                                          </Button>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 p-0 text-red-600 hover:bg-transparent" title="Delete detailed task" onClick={() => removeDetailed(group.documentId, actionItem.id, item.id)}>
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 align-middle whitespace-normal break-words">
                                      {item.department || ns}
                                    </td>
                                    <td className="px-6 py-4 align-middle whitespace-normal break-words">
                                      {item.person || ns}
                                    </td>
                                    <td className="px-6 py-4 align-middle text-center whitespace-nowrap">
                                      {item.deadline
                                        ? item.deadline.toLocaleDateString("en-GB", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                          })
                                        : ns}
                                    </td>
                                    <td className="px-6 py-4 align-middle">
                                      <div className="flex justify-center">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusClasses(item.status)}`}>
                                          {item.status === ns ? ns : toTitle(item.status)}
                                        </span>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="px-6 py-6 text-center text-slate-500">
                            No detailed tasks for this action item.
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </main>
      {/* Edit Action Item Modal */}
      <Dialog open={!!editActionItem} onOpenChange={(v) => { if (!v) setEditActionItem(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Action Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-600">Title</label>
              <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-gray-600">Short Description</label>
              <Textarea rows={3} value={formDesc} onChange={(e) => setFormDesc(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-600">Page Number</label>
                <Input type="number" value={formPage} onChange={(e) => setFormPage(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-gray-600">Deadline</label>
                <Input type="date" value={formDeadline} onChange={(e) => setFormDeadline(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setEditActionItem(null)}>Cancel</Button>
              <Button onClick={applyEdit}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Detailed Task Modal */}
      <Dialog open={!!addDetailedFor} onOpenChange={(v) => { if (!v) setAddDetailedFor(null); }}>
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
                <label className="text-xs text-gray-600">Status</label>
                <Input placeholder="Pending / In Progress / Done" value={taskStatus} onChange={(e) => setTaskStatus(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-600">Deadline</label>
              <Input type="date" value={taskDeadline} onChange={(e) => setTaskDeadline(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setAddDetailedFor(null)}>Cancel</Button>
              <Button onClick={applyAddDetailed}>Add</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Detailed Task Modal */}
      <Dialog open={!!editDetailedFor} onOpenChange={(v) => { if (!v) setEditDetailedFor(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Detailed Task</DialogTitle>
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
                <label className="text-xs text-gray-600">Status</label>
                <Input placeholder="Pending / In Progress / Done" value={taskStatus} onChange={(e) => setTaskStatus(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-600">Deadline</label>
              <Input type="date" value={taskDeadline} onChange={(e) => setTaskDeadline(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setEditDetailedFor(null)}>Cancel</Button>
              <Button onClick={applyEditDetailed}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteActionItem} onOpenChange={(v) => { if (!v) setDeleteActionItem(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Action Item?</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-slate-700">This will remove the action item and its detailed tasks locally.</div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setDeleteActionItem(null)}>Cancel</Button>
            <Button variant="destructive" onClick={applyDelete}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
