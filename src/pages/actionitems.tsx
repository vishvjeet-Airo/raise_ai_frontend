"use client"; // This is a client component because it uses hooks like useState

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Sidebar } from "@/components/Sidebar"; // Assuming sidebar path
import { Search, ArrowUp, ArrowDown } from 'lucide-react';

// 1. --- DEFINE TYPES ---
type ActionItem = {
  id: string;
  action: string;
  person: string;
  department: 'IT' | 'Compliance' | 'Treasury' | 'Training';
  deadline: Date;
  circularId: string;
  circularName: string;
};

// 2. --- HARDCODED MOCK DATA ---
const mockActionItems: ActionItem[] = [
  {
    id: 'act-001',
    action: 'Update internal software for new export declaration forms (EDF).',
    person: 'Alice Johnson',
    department: 'IT',
    deadline: new Date('2025-09-15'),
    circularId: 'doc-001',
    circularName: 'Foreign Exchange Management Regulations, 2025',
  },
  {
    id: 'act-002',
    action: 'Train branch managers on amended export regulations.',
    person: 'Bob Williams',
    department: 'Training',
    deadline: new Date('2025-10-01'),
    circularId: 'doc-001',
    circularName: 'Foreign Exchange Management Regulations, 2025',
  },
  {
    id: 'act-003',
    action: 'Adjust monitoring thresholds for FPI investments.',
    person: 'Charlie Brown',
    department: 'Treasury',
    deadline: new Date('2025-08-30'),
    circularId: 'doc-002',
    circularName: 'Limits for investment in debt by FPIs',
  },
  {
    id: 'act-004',
    action: 'Draft and circulate the updated internal compliance checklist.',
    person: 'Diana Prince',
    department: 'Compliance',
    deadline: new Date('2025-09-20'),
    circularId: 'doc-001',
    circularName: 'Foreign Exchange Management Regulations, 2025',
  },
  {
    id: 'act-005',
    action: 'Inform relationship managers of new CDS limits for FPIs.',
    person: 'Edward Smith',
    department: 'Treasury',
    deadline: new Date('2025-09-05'),
    circularId: 'doc-002',
    circularName: 'Limits for investment in debt by FPIs',
  },
];

const departments = ['IT', 'Compliance', 'Treasury', 'Training'];

// 3. --- MAIN PAGE COMPONENT ---
export default function ActionItemsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState<{ key: keyof ActionItem; direction: 'asc' | 'desc' } | null>({ key: 'deadline', direction: 'asc' });

  // --- FILTERING AND SORTING LOGIC ---
  const sortedAndFilteredItems = useMemo(() => {
    let items = [...mockActionItems];

    // Filter by department
    if (departmentFilter !== 'All') {
      items = items.filter(item => item.department === departmentFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      items = items.filter(item =>
        item.action.toLowerCase().includes(lowercasedTerm) ||
        item.person.toLowerCase().includes(lowercasedTerm) ||
        item.circularName.toLowerCase().includes(lowercasedTerm)
      );
    }
    
    // Sort items
    if (sortConfig !== null) {
      items.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return items;
  }, [searchTerm, departmentFilter, sortConfig]);

  const handleSort = (key: keyof ActionItem) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-semibold text-gray-800">
              Action Items
            </h1>
          </div>

          {/* Controls: Search and Filter */}
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="h-10 px-6 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer -ml-9"
            >
              <option value="All">All Departments</option>
              {departments.map(dep => <option key={dep} value={dep}>{dep}</option>)}
            </select>
          </div>

          {/* Table */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="bg-[#E5F6F0] fntext-xs text-gray-700 tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-3 w-2/5">Action Items</th>
                  <th scope="col" className="px-6 py-3 whitespace-nowrap">Person Assigned</th>
                  <th scope="col" className="px-6 py-3">Department</th>
                  <th scope="col" className="px-6 py-3">
                    <button onClick={() => handleSort('deadline')} className="flex items-center gap-1.5 hover:text-gray-900">
                      Deadline
                      {sortConfig?.key === 'deadline' ? (
                        sortConfig.direction === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                      ) : (
                         <ArrowUp className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3">Circular</th>
                </tr>
              </thead>
              <tbody>
                {sortedAndFilteredItems.map((item) => (
                  <tr key={item.id} className="bg-white border-b last:border-b-0 hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-600">{item.action}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.person}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.deadline.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/documents/${item.circularId}`} className="font-medium text-blue-600 hover:underline">
                        {item.circularName}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {sortedAndFilteredItems.length === 0 && (
                <div className="text-center p-8 text-gray-500">
                    No action items found.
                </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
