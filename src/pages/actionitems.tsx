import React, { useState } from 'react';
import { Sidebar } from "@/components/Sidebar"; // Assuming you have a Sidebar component
import { Search, Filter, ChevronDown, Calendar, Flag, User, CheckCircle2, Circle, Clock } from 'lucide-react';

// --- MOCK DATA ---
// Afterwards, this data would come from your API

const actionItemsData = [
  {
    circularId: 'doc-001',
    circularName: 'Foreign Exchange Management (Export of Goods & Services) Regulations, 2025',
    publisher: 'Reserve Bank of India',
    actions: [
      {
        id: 'act-001-a',
        description: 'Update internal software to handle new export declaration forms (EDF).',
        assignedTo: 'IT Department',
        dueDate: '2025-09-15',
      },
      {
        id: 'act-001-b',
        description: 'Train all branch managers on the amended regulations for export services.',
        assignedTo: 'Training & Development',
        dueDate: '2025-10-01',
      },
      {
        id: 'act-001-c',
        description: 'Draft and circulate the updated internal compliance checklist.',
        assignedTo: 'Compliance Team',
        dueDate: '2025-09-20',
      },
    ],
  },
  {
    circularId: 'doc-002',
    circularName: 'Limits for investment in debt and sale of Credit Default Swaps by Foreign Portfolio Investors (FPIs)',
    publisher: 'Reserve Bank of India',
    actions: [
      {
        id: 'act-002-a',
        description: 'Adjust the monitoring thresholds for FPI investments in the treasury system.',
        assignedTo: 'Treasury Department',
        dueDate: '2025-08-30',
      },
      {
        id: 'act-002-b',
        description: 'Inform all relationship managers handling FPI accounts of the new CDS limits.',
        assignedTo: 'Wealth Management',
        dueDate: '2025-09-05',
      },
    ],
  },
];


// --- MAIN COMPONENT ---

export default function ActionItems() {
  const [searchTerm, setSearchTerm] = useState('');

  // Filtering logic would be added here in a real app
  const filteredData = actionItemsData.filter(item => 
    item.circularName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.actions.some(action => action.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="bg-[#FBFBFB] p-6 min-h-full">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-[#1F4A75]">Action Items</h1>
          </div>

          {/* Filters and Search */}
          <div className="flex items-center space-x-4 mb-6 bg-white p-4 rounded-lg border border-gray-200">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by circular or action item..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
             
          </div>

          {/* Action Items List */}
          <div className="space-y-5">
            {filteredData.map((item) => (
              <div key={item.circularId} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="font-semibold text-gray-800">{item.circularName}</h2>
                  <p className="text-xs text-gray-500">{item.publisher}</p>
                </div>
                <div className="divide-y divide-gray-100">
                  {item.actions.map(action => (
                    <div key={action.id} className="p-4 flex items-start space-x-4 hover:bg-gray-50">
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">{action.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <div className="flex items-center space-x-1.5">
                            <User className="w-3 h-3" />
                            <span>{action.assignedTo}</span>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <Calendar className="w-3 h-3" />
                            <span>Due: {action.dueDate}</span>
                          </div>
                        </div>
                      </div>
                      
                    </div>
                  ))}
                </div>
              </div>
            ))}
             {filteredData.length === 0 && (
              <div className="text-center py-16 bg-white rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500">No action items match your search.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
