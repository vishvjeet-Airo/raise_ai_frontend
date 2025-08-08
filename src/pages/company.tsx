import React, { useState } from 'react';
import { Building2, Pencil, Trash2, Plus, Users, ChevronDown, ChevronRight } from 'lucide-react';
import { Sidebar } from "@/components/Sidebar";

// --- TYPE DEFINITIONS for our data structure ---
interface Position {
  id: string;
  role: string;
  employeeName: string;
  employeeId: string;
}

interface Department {
  id: string;
  name: string;
  positions: Position[];
}

interface CompanyProfileData {
  companyName: string;
  cin: string;
  rbiLicenseNo: string;
  address: string;
  departments: Department[];
}

// --- DUMMY DATA to populate the page ---
const initialCompanyData: CompanyProfileData = {
  companyName: "SecureBank India Ltd.",
  cin: "U12345MH2025PTC67890",
  rbiLicenseNo: "RBI-LIC-12345/2025",
  address: "123 Banking Lane, Financial District, Mumbai, Maharashtra, 400001",
  departments: [
    {
      id: "dept1",
      name: "Treasury Department",
      positions: [
        { id: "pos1", role: "Head of Treasury", employeeName: "Anjali Sharma", employeeId: "EMP45601" },
        { id: "pos2", role: "Forex Dealer", employeeName: "Rohan Mehta", employeeId: "EMP45602" },
        { id: "pos3", role: "Securities Analyst", employeeName: "Priya Singh", employeeId: "EMP45603" },
      ],
    },
    {
      id: "dept2",
      name: "Compliance Department",
      positions: [
        { id: "pos4", role: "Chief Compliance Officer", employeeName: "Vikram Batra", employeeId: "EMP11201" },
        { id: "pos5", role: "AML Specialist", employeeName: "Sunita Reddy", employeeId: "EMP11202" },
      ],
    },
    {
        id: "dept3",
        name: "Retail Banking",
        positions: [
            { id: "pos6", role: "Branch Manager", employeeName: "Arjun Desai", employeeId: "EMP78901" },
            { id: "pos7", role: "Loan Officer", employeeName: "Meera Krishnan", employeeId: "EMP78902" },
        ]
    }
  ],
};


// --- SUB-COMPONENT: DepartmentAccordion ---
const DepartmentAccordion = ({ department }: { department: Department }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200">
      {/* Accordion Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-4">
          {isOpen ? <ChevronDown size={20} className="text-blue-600" /> : <ChevronRight size={15} className="text-gray-500" />}
          <h3 className="font-semibold text-l text-gray-800">{department.name}</h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            {department.positions.length} Positions
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-gray-500 hover:text-blue-600"><Pencil size={15} /></button>
          <button className="text-gray-500 hover:text-red-600"><Trash2 size={15} /></button>
        </div>
      </div>

      {/* Accordion Content (Positions Table) */}
      {isOpen && (
        <div className="pl-8 pr-4 pb-4 bg-white">
          <table className="min-w-full">
            <thead className="text-left text-sm text-gray-500">
              <tr>
                <th className="p-2 font-medium">Position / Role</th>
                <th className="p-2 font-medium">Employee Name</th>
                <th className="p-2 font-medium">Employee ID</th>
                <th className="p-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {department.positions.map((pos) => (
                <tr key={pos.id} className="border-t border-gray-100">
                  <td className="p-3 text-xs">{pos.role}</td>
                  <td className="p-3 text-xs">{pos.employeeName}</td>
                  <td className="p-3 font-mono text-xs">{pos.employeeId}</td>
                  <td className="p-3 text-right">
                     <div className="flex items-center justify-end gap-3">
                        <button className="text-gray-500 hover:text-blue-600"><Pencil size={16} /></button>
                        <button className="text-gray-500 hover:text-red-600"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
           <button className="mt-4 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-semibold py-2 px-3 rounded-md hover:bg-blue-50">
                <Plus size={13} />
                Add Position to {department.name.split(' ')[0]}
            </button>
        </div>
      )}
    </div>
  );
};


// --- MAIN PAGE COMPONENT ---
export default function CompanyProfilePage() {
  const [profile, setProfile] = useState<CompanyProfileData>(initialCompanyData);

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-xl font-bold text-gray-500">Company Profile</h1>
          <button className="flex items-center gap-2 bg-[#1F4A75] text-white text-sm font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-blue-900 transition-colors">
            <Pencil size={16} />
            Edit Profile
          </button>
        </div>

        {/* Company Details Card */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-l font-bold text-[#1F4A75] flex items-center gap-3 mb-4">
            <Building2 className="text-blue-600 w-5 h-5" />
            Company Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Company Name</label>
              <p className="text-sm text-gray-900">{profile.companyName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Corporate Identity No. (CIN)</label>
              <p className="text-sm text-gray-900 font-mono">{profile.cin}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">RBI License No.</label>
              <p className="text-sm text-gray-900 font-mono">{profile.rbiLicenseNo}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Registered Address</label>
              <p className="text-sm text-gray-900">{profile.address}</p>
            </div>
          </div>
        </div>

        {/* Departments & Structure Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
           <div className="flex justify-between items-center mb-4">
              <h2 className="text-l font-bold text-[#1F4A75] flex items-center gap-3">
                  <Users className="text-blue-600 w-5 h-5" />
                  Departments & Structure
              </h2>
               <button className="flex items-center gap-2 bg-gray-100 text-sm text-[#1F4A75] font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-[#DEDEDE] transition-colors">
                  <Plus size={15} />
                  Add Department
              </button>
           </div>
           <div className="border border-gray-200 rounded-lg overflow-hidden">
              {profile.departments.map(dept => (
                  <DepartmentAccordion key={dept.id} department={dept} />
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}