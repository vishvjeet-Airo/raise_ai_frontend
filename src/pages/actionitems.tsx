import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Search, ArrowUp, ArrowDown } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";

// API types (subset)
type ApiActionPoint = {
  id: number;
  title: string;
  description?: string | null;
  source_page?: number | null;
  deadline?: string | null; // ISO or YYYY-MM-DD or null
  is_relevant?: boolean;
  assigned_to_name?: string | null;
  assigned_to_department?: string | null;
};

type ApiDocument = {
  id: number;
  title?: string | null;
  issuing_authority?: string | null;
  publication_date?: string | null;
  action_points?: ApiActionPoint[] | null;
};

type RowItem = {
  id: number;
  action: string;
  person: string;
  department: string;
  deadline: Date | null;
  circularId: number;
  circularName: string;
};

type DocGroup = {
  documentId: number;
  documentTitle: string;
  rows: RowItem[];
};

const getAuthHeaders = (): HeadersInit | undefined => {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : undefined;
};

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

  // Fetch documents + action_points
  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/api/documents`, {
          headers: {
            accept: "application/json",
            ...getAuthHeaders(),
          },
        });
        if (!res.ok) throw new Error(`Failed to fetch (${res.status})`);
        const data: ApiDocument[] = await res.json();

        const mapped: DocGroup[] = (data || []).map((doc) => {
          const rows: RowItem[] = (doc.action_points || []).map((ap) => ({
            id: ap.id,
            action: ap.title || ap.description || "Untitled action",
            person: ap.assigned_to_name || "-",
            department: ap.assigned_to_department || "-",
            deadline: ap.deadline ? new Date(ap.deadline) : null,
            circularId: doc.id,
            circularName: doc.title || `Document ${doc.id}`,
          }));
          return {
            documentId: doc.id,
            documentTitle: doc.title || `Document ${doc.id}`,
            rows,
          };
        });

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
    groups.forEach((g) => g.rows.forEach((r) => r.department && set.add(r.department)));
    return ["All", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [groups]);

  // Apply search, filter, and sort per document group
  const filteredAndSortedGroups = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const dir = sortConfig?.direction || "asc";

    const cmpDeadline = (a: RowItem, b: RowItem) => {
      // nulls last for asc, first for desc
      if (!a.deadline && !b.deadline) return 0;
      if (!a.deadline) return dir === "asc" ? 1 : -1;
      if (!b.deadline) return dir === "asc" ? -1 : 1;
      return a.deadline.getTime() - b.deadline.getTime();
    };

    return groups
      .map((g) => {
        let rows = [...g.rows];

        if (departmentFilter !== "All") {
          rows = rows.filter((r) => r.department === departmentFilter);
        }

        if (term) {
          rows = rows.filter(
            (r) =>
              r.action.toLowerCase().includes(term) ||
              r.person.toLowerCase().includes(term) ||
              r.circularName.toLowerCase().includes(term) ||
              r.department.toLowerCase().includes(term)
          );
        }

        if (sortConfig?.key === "deadline") {
          rows.sort(cmpDeadline);
          if (dir === "desc") rows.reverse();
        }

        return { ...g, rows };
      })
      .filter((g) => g.rows.length > 0);
  }, [groups, searchTerm, departmentFilter, sortConfig]);

  const handleSort = (key: "deadline") => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
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
                  <div className="flex items-center justify-between mb-4">
                    <Link
                      to={`/documents/${group.documentId}`}
                      className="text-lg font-semibold text-[#0F2353] hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded transition-colors"
                      title="Open document details"
                    >
                      {group.documentTitle}
                    </Link>
                  </div>

                  {/* Table Card */}
                  <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="overflow-x-auto overflow-y-hidden rounded-xl">
                      <table className="w-full table-auto text-sm text-left text-slate-700">
                        {/* Consistent column widths across all tables */}
                        <colgroup>
                          <col style={{ width: "36%" }} />
                          <col style={{ width: "24%" }} />
                          <col style={{ width: "20%" }} />
                          <col style={{ width: "12%" }} />
                          <col style={{ width: "8%" }} />
                        </colgroup>
                        <thead className="bg-slate-50 text-xs text-slate-600">
                          <tr className="border-b border-slate-200">
                            <th scope="col" className="px-6 py-3 font-semibold text-left">Action Items</th>
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
                          {group.rows.map((item, idx) => (
                            <tr
                              key={item.id}
                              className={`border-b border-slate-100 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"} hover:bg-slate-50`}
                            >
                              <td className="px-6 py-4 align-middle overflow-hidden">
                                <div className="whitespace-pre-wrap break-words">{item.action}</div>
                              </td>
                              <td className="px-6 py-4 align-middle overflow-hidden">
                                <div className="whitespace-normal break-words">{item.department}</div>
                              </td>
                              <td className="px-6 py-4 align-middle overflow-hidden">
                                <div className="whitespace-normal break-words">{item.person}</div>
                              </td>
                              <td className="px-6 py-4 align-middle text-center whitespace-nowrap">
                                {item.deadline
                                  ? item.deadline.toLocaleDateString("en-GB", {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    })
                                  : "N/A"}
                              </td>
                              <td className="px-6 py-4 align-middle">
                                <div className="flex justify-center">
                                  <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-700 px-2.5 py-0.5 text-xs font-medium">
                                    Pending
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {group.rows.length === 0 && (
                            <tr>
                              <td colSpan={5} className="px-6 py-6 text-center text-slate-500">
                                No action items for this document.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </main>   
    </div>  
  );
}