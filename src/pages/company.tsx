import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/config';
import { 
    Building2, Pencil, Plus, Briefcase, Trash2, X, LoaderCircle,
    Globe, ShieldCheck, FileText, Landmark, ClipboardCheck, AlertTriangle, Users, History
} from 'lucide-react';
import { Sidebar } from "@/components/Sidebar";

// --- API Service ---
// CORRECTED: Changed from "organisations" to "organisation" to match your API docs
const ORGANISATION_API_ENDPOINT = `${API_BASE_URL}/api/organisation`;

const api = {
    getOrganizationFull: (orgId: number) => 
        axios.get<OrganizationData>(`${ORGANISATION_API_ENDPOINT}/organization/${orgId}/full`),

    createItem: (modelType: ModelType, organizationId: number, itemData: any) => 
        axios.post(`${ORGANISATION_API_ENDPOINT}/${modelType}?organization_id=${organizationId}`, itemData),

    updateItem: (modelType: ModelType, itemId: number, itemData: any) => 
        axios.put(`${ORGANISATION_API_ENDPOINT}/${modelType}/${itemId}`, itemData),

    deleteItem: (modelType: ModelType, itemId: number) => 
        axios.delete(`${ORGANISATION_API_ENDPOINT}/${modelType}/${itemId}`),
};

// --- TYPE DEFINITIONS (Matching Backend Schemas) ---

type ModelType = 'organization' | 'jurisdiction' | 'license' | 'regulator' | 'business_unit' | 'standard' | 'critical_process' | 'third_party' | 'compliance_record';

interface Jurisdiction { id: number; country: string; state?: string; city?: string; }
interface License { id: number; license_name: string; license_number?: string; issuing_authority?: string; expiry_date?: string; }
interface Regulator { id: number; name: string; jurisdiction?: string; }
interface BusinessUnit { id: number; name: string; head_name?: string; }
interface Standard { id: number; name: string; certification_number?: string; valid_until?: string; }
interface CriticalProcess { id: number; name: string; description?: string; }
interface ThirdParty { id: number; name: string; service_provided?: string; contract_expiry?: string; }
interface ComplianceRecord { id: number; record_type: string; description: string; date: string; outcome?: string; }

// Main Organization Data Structure
interface OrganizationData {
    id: number;
    name: string;
    legal_entity_type: string;
    industry_classification?: string;
    employee_count?: number;
    annual_turnover?: number;
    jurisdictions: Jurisdiction[];
    licenses: License[];
    regulators: Regulator[];
    business_units: BusinessUnit[];
    standards: Standard[];
    critical_processes: CriticalProcess[];
    third_parties: ThirdParty[];
    compliance_history: ComplianceRecord[];
}

// --- TYPE DEFINITIONS for Component Props ---
interface InfoItemProps { label: string; value: React.ReactNode; }
interface FormInputProps {
    label: string;
    name: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    type?: string;
}
interface ModalConfig { mode: 'create' | 'edit'; modelType: ModelType; data?: any; }
interface EditModalProps {
    modalConfig: ModalConfig;
    onClose: () => void;
    onSave: (modelType: ModelType, itemData: any, orgId: number) => void;
    orgId: number;
}
interface ListItemProps { modelType: ModelType; item: { id: number }; children: React.ReactNode; }
interface CardHeaderProps { title: string; icon: React.ReactElement; onAdd: () => void; }


// --- REUSABLE COMPONENTS with PROPS TYPED ---

const InfoItem = ({ label, value }: InfoItemProps) => (
    <div>
        <label className="block text-sm font-medium text-gray-500">{label}</label>
        <p className="text-sm text-gray-900 break-words">{value || 'N/A'}</p>
    </div>
);

const FormInput = ({ label, name, value, onChange, placeholder = '', type = 'text' }: FormInputProps) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <input
            type={type} id={name} name={name} value={value} onChange={onChange}
            placeholder={placeholder}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
    </div>
);

const CardHeader = ({ title, icon, onAdd }: CardHeaderProps) => (
    <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h2 className="text-l font-bold text-[#1F4A75] flex items-center gap-3">
            {React.cloneElement(icon, { className: "w-5 h-5" })} {title}
        </h2>
        <button onClick={onAdd} className="flex items-center gap-2 text-sm text-[#1F4A75] font-semibold p-2 rounded-lg hover:bg-gray-100"><Plus size={16} />Add</button>
    </div>
);


// --- MODAL & FORMS (Fully Typed) ---
const EditModal = ({ modalConfig, onClose, onSave, orgId }: EditModalProps) => {
    const { mode, modelType, data } = modalConfig;
    const [formData, setFormData] = useState<any>(data || {});

    useEffect(() => { setFormData(data || {}); }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const cleanFormData = Object.fromEntries(Object.entries(formData).filter(([_, v]) => v != null && v !== ''));
        onSave(modelType, cleanFormData, orgId);
    };

    const renderFormFields = () => {
        switch (modelType) {
            case 'organization':
                return <>
                    <FormInput label="Company Name" name="name" value={formData.name || ''} onChange={handleChange} />
                    <FormInput label="Legal Entity Type" name="legal_entity_type" value={formData.legal_entity_type || ''} onChange={handleChange} />
                    <FormInput label="Industry" name="industry_classification" value={formData.industry_classification || ''} onChange={handleChange} />
                    <FormInput label="Employee Count" name="employee_count" value={formData.employee_count || 0} onChange={handleChange} type="number"/>
                    <FormInput label="Annual Turnover" name="annual_turnover" value={formData.annual_turnover || 0} onChange={handleChange} type="number"/>
                </>;
            case 'jurisdiction':
                 return <>
                    <FormInput label="Country" name="country" value={formData.country || ''} onChange={handleChange} />
                    <FormInput label="State" name="state" value={formData.state || ''} onChange={handleChange} />
                    <FormInput label="City" name="city" value={formData.city || ''} onChange={handleChange} />
                </>;
            case 'license':
                return <>
                    <FormInput label="License Name" name="license_name" value={formData.license_name || ''} onChange={handleChange} />
                    <FormInput label="License Number" name="license_number" value={formData.license_number || ''} onChange={handleChange} />
                    <FormInput label="Issuing Authority" name="issuing_authority" value={formData.issuing_authority || ''} onChange={handleChange} />
                    <FormInput label="Expiry Date" name="expiry_date" value={formData.expiry_date || ''} onChange={handleChange} placeholder="YYYY-MM-DD" type="date" />
                </>;
            case 'regulator':
                return <>
                    <FormInput label="Regulator Name" name="name" value={formData.name || ''} onChange={handleChange} />
                    <FormInput label="Jurisdiction" name="jurisdiction" value={formData.jurisdiction || ''} onChange={handleChange} />
                </>;
            case 'business_unit':
                return <>
                    <FormInput label="Unit Name" name="name" value={formData.name || ''} onChange={handleChange} />
                    <FormInput label="Head Name" name="head_name" value={formData.head_name || ''} onChange={handleChange} />
                </>;
            case 'standard':
                return <>
                    <FormInput label="Standard Name" name="name" value={formData.name || ''} onChange={handleChange} />
                    <FormInput label="Certification Number" name="certification_number" value={formData.certification_number || ''} onChange={handleChange} />
                    <FormInput label="Valid Until" name="valid_until" value={formData.valid_until || ''} onChange={handleChange} placeholder="YYYY-MM-DD" type="date"/>
                </>;
            case 'critical_process':
                return <>
                    <FormInput label="Process Name" name="name" value={formData.name || ''} onChange={handleChange} />
                    <FormInput label="Description" name="description" value={formData.description || ''} onChange={handleChange} />
                </>;
            case 'third_party':
                return <>
                    <FormInput label="Vendor/Partner Name" name="name" value={formData.name || ''} onChange={handleChange} />
                    <FormInput label="Service Provided" name="service_provided" value={formData.service_provided || ''} onChange={handleChange} />
                    <FormInput label="Contract Expiry" name="contract_expiry" value={formData.contract_expiry || ''} onChange={handleChange} placeholder="YYYY-MM-DD" type="date"/>
                </>;
            case 'compliance_record':
                return <>
                    <FormInput label="Record Type" name="record_type" value={formData.record_type || ''} onChange={handleChange} placeholder="e.g., Audit, Incident"/>
                    <FormInput label="Description" name="description" value={formData.description || ''} onChange={handleChange} />
                    <FormInput label="Date" name="date" value={formData.date || ''} onChange={handleChange} placeholder="YYYY-MM-DD" type="date"/>
                    <FormInput label="Outcome" name="outcome" value={formData.outcome || ''} onChange={handleChange} />
                </>;
            default:
                return <p>Invalid form type.</p>;
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg max-h-full overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-[#1F4A75] capitalize">{mode} {modelType.replace(/_/g, ' ')}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {renderFormFields()}
                    <div className="flex justify-end gap-4 mt-6">
                        <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="py-2 px-4 bg-[#1F4A75] text-white rounded-lg hover:bg-blue-900">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- MAIN PAGE COMPONENT ---
export default function CompanyProfilePage() {
    const [profile, setProfile] = useState<OrganizationData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);

    const ORGANIZATION_ID = 1;

    const fetchData = async () => {
      try {
          if (!loading) setLoading(true);
          const response = await api.getOrganizationFull(ORGANIZATION_ID);
          setProfile(response.data);
          setError(null);
      } catch (err: unknown) {
          let errorMessage = "An unexpected error occurred.";
      
          // Manually check if the error object looks like an Axios error
          if (err && typeof err === 'object' && 'isAxiosError' in err && err.isAxiosError) {
              const axiosError = err as any; // Treat as any to access properties safely
      
              if (axiosError.response) {
                  // The server responded with an error (e.g., 404, 500)
                  errorMessage = `Error: Server responded with status ${axiosError.response.status}.`;
                  console.error("Server Error:", axiosError.response.data);
              } else if (axiosError.request) {
                  // The request was made, but no response was received
                  errorMessage = "Network Error: Could not connect to the API.";
                  console.error("Network Error:", axiosError.request);
              } else {
                  // Another type of setup error
                  errorMessage = axiosError.message;
                  console.error("Request Setup Error:", axiosError.message);
              }
          } else if (err instanceof Error) {
              // Handle a standard JavaScript error
              errorMessage = err.message;
              console.error("Generic Error:", err);
          }
          
          setError(errorMessage);
      } finally {
          setLoading(false);
      }
    };

    useEffect(() => { fetchData(); }, []);

    const handleOpenModal = (mode: 'create' | 'edit', modelType: ModelType, data: any = {}) => setModalConfig({ mode, modelType, data });
    const handleCloseModal = () => setModalConfig(null);

    const handleSave = async (modelType: ModelType, itemData: any, orgId: number) => {
        try {
            const dataToSend = { ...itemData };
            if (modalConfig?.mode === 'create') {
                delete dataToSend.id;
            }

            if (modalConfig?.mode === 'create') {
                await api.createItem(modelType, orgId, dataToSend);
            } else {
                await api.updateItem(modelType, dataToSend.id, dataToSend);
            }
            handleCloseModal();
            fetchData();
        } catch (err: any) {
            const errorMsg = err.response?.data?.detail || `Error saving ${modelType.replace(/_/g, ' ')}.`;
            alert(errorMsg);
            console.error(err);
        }
    };
    
    const handleDelete = async (modelType: ModelType, itemId: number) => {
        if (window.confirm(`Are you sure you want to delete this ${modelType.replace(/_/g, ' ')}?`)) {
            try {
                await api.deleteItem(modelType, itemId);
                fetchData();
            } catch (err) {
                alert(`Error deleting ${modelType.replace(/_/g, ' ')}. Check console for details.`);
                console.error(err);
            }
        }
    };

    const ListItem = ({ modelType, item, children }: ListItemProps) => (
        <div className="flex justify-between items-center p-2 rounded-md hover:bg-gray-50">
            <div>{children}</div>
            <div className="flex gap-3 flex-shrink-0 ml-4">
                <button onClick={() => handleOpenModal('edit', modelType, item)} className="text-gray-500 hover:text-blue-600"><Pencil size={16} /></button>
                <button onClick={() => handleDelete(modelType, item.id)} className="text-gray-500 hover:text-red-600"><Trash2 size={16} /></button>
            </div>
        </div>
    );
    
    if (loading) {
        return <div className="flex items-center justify-center h-screen bg-slate-50"><LoaderCircle className="animate-spin text-[#1F4A75]" size={48} /><span className="ml-4 text-lg text-gray-600">Loading Profile...</span></div>;
    }
    if (error || !profile) {
        return <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-red-600"><div className="flex items-center"><X size={48} /><span className="ml-4 text-lg font-semibold">An Error Occurred</span></div><p className="mt-2 text-center max-w-md">{error || "Could not load profile data."}</p></div>;
    }
    
    return (
        <> 
         {modalConfig && <EditModal modalConfig={modalConfig} onClose={handleCloseModal} onSave={handleSave} orgId={profile.id} />}
        <div className="flex bg-slate-50">
        <Sidebar />

        <div className="flex-1 p-8 h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-xl font-bold text-gray-500">Company Profile</h1>
               
            </div>

                    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                            <h2 className="text-l font-bold text-[#1F4A75] flex items-center gap-3">
                                {React.cloneElement(<Building2/>, { className: "w-5 h-5" })} General Profile
                            </h2>
                            <button onClick={() => handleOpenModal('edit', 'organization', profile)} className="flex items-center gap-2 text-sm text-[#1F4A75] font-semibold p-2 rounded-lg hover:bg-gray-100"><Pencil size={16} />Edit</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6 pt-4">
                            <InfoItem label="Company Name" value={profile.name} />
                            <InfoItem label="Legal Entity Type" value={profile.legal_entity_type} />
                            <InfoItem label="Industry" value={profile.industry_classification} />
                            <InfoItem label="Employee Count" value={profile.employee_count?.toLocaleString()} />
                            <InfoItem label="Annual Turnover" value={profile.annual_turnover?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} />
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-8">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <CardHeader title="Jurisdictions" icon={<Globe/>} onAdd={() => handleOpenModal('create', 'jurisdiction')}/>
                            {profile.jurisdictions?.map(j => <ListItem key={j.id} modelType="jurisdiction" item={j}><span>{j.city}, {j.state}, {j.country}</span></ListItem>)}
                        </div>
                        
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <CardHeader title="Business Units" icon={<Briefcase/>} onAdd={() => handleOpenModal('create', 'business_unit')}/>
                            {profile.business_units?.map(bu => <ListItem key={bu.id} modelType="business_unit" item={bu}><p className="font-semibold">{bu.name}</p><p className="text-xs text-gray-500">Head: {bu.head_name || 'N/A'}</p></ListItem>)}
                        </div>
                        
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <CardHeader title="Licenses & Registrations" icon={<FileText/>} onAdd={() => handleOpenModal('create', 'license')}/>
                            {profile.licenses?.map(lic => <ListItem key={lic.id} modelType="license" item={lic}><p className="font-semibold">{lic.license_name}</p><p className="text-xs text-gray-500">Expires: {lic.expiry_date || 'N/A'}</p></ListItem>)}
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <CardHeader title="Regulators" icon={<Landmark/>} onAdd={() => handleOpenModal('create', 'regulator')}/>
                           {profile.regulators?.map(reg => <ListItem key={reg.id} modelType="regulator" item={reg}><span>{reg.name} ({reg.jurisdiction})</span></ListItem>)}
                        </div>
                        
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <CardHeader title="Standards Adopted" icon={<ClipboardCheck/>} onAdd={() => handleOpenModal('create', 'standard')}/>
                           {profile.standards?.map(std => <ListItem key={std.id} modelType="standard" item={std}><p className="font-semibold">{std.name}</p><p className="text-xs text-gray-500">Valid Until: {std.valid_until || 'N/A'}</p></ListItem>)}
                        </div>
                        
                        <div className="bg-white p-6 rounded-lg shadow-md">
                           <CardHeader title="Critical Processes" icon={<AlertTriangle/>} onAdd={() => handleOpenModal('create', 'critical_process')}/>
                           {profile.critical_processes?.map(cp => <ListItem key={cp.id} modelType="critical_process" item={cp}><p className="font-semibold">{cp.name}</p><p className="text-xs text-gray-500">{cp.description}</p></ListItem>)}
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <CardHeader title="Third-Party Dependencies" icon={<Users/>} onAdd={() => handleOpenModal('create', 'third_party')}/>
                            {profile.third_parties?.map(tp => <ListItem key={tp.id} modelType="third_party" item={tp}><p className="font-semibold">{tp.name}</p><p className="text-xs text-gray-500">{tp.service_provided}</p></ListItem>)}
                        </div>
                        
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <CardHeader title="Compliance History" icon={<History/>} onAdd={() => handleOpenModal('create', 'compliance_record')}/>
                            {profile.compliance_history?.map(ch => <ListItem key={ch.id} modelType="compliance_record" item={ch}><p className="font-semibold">{ch.record_type} ({ch.date})</p><p className="text-xs text-gray-500">{ch.description} - <strong>{ch.outcome}</strong></p></ListItem>)}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}