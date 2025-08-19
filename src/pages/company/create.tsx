import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/config';
import {
    Building2, Pencil, Plus, Briefcase, Trash2, X, LoaderCircle,
    Globe, ShieldCheck, FileText, Landmark, ClipboardCheck, AlertTriangle, Users, History
} from 'lucide-react';
import { Sidebar } from "@/components/Sidebar";

const ORGANISATION_API_ENDPOINT = `${API_BASE_URL}/api/organisations`;

// --- API Abstraction ---
const api = {
    createOrganization: (orgData: CreateOrganizationData) =>
        axios.post<{ id: number }>(`${ORGANISATION_API_ENDPOINT}/organization/create`, orgData),

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

interface CreateOrganizationData {
    name: string;
    legal_entity_type: string;
    industry_classification?: string;
    employee_count?: number;
    annual_turnover?: number;
}

interface Jurisdiction { id: number; country: string; state?: string; city?: string; }
interface License { id: number; license_name: string; license_number?: string; issuing_authority?: string; expiry_date?: string; }
interface Regulator { id: number; name: string; jurisdiction?: string; }
interface BusinessUnit { id: number; name: string; head_name?: string; }
interface Standard { id: number; name: string; certification_number?: string; valid_until?: string; }
interface CriticalProcess { id: number; name: string; description?: string; }
interface ThirdParty { id: number; name: string; service_provided?: string; contract_expiry?: string; }
interface ComplianceRecord { id: number; record_type: string; description: string; date: string; outcome?: string; }

interface OrganizationData extends CreateOrganizationData {
    id: number;
    jurisdictions: Jurisdiction[];
    licenses: License[];
    regulators: Regulator[];
    business_units: BusinessUnit[];
    standards: Standard[];
    critical_processes: CriticalProcess[];
    third_parties: ThirdParty[];
    compliance_history: ComplianceRecord[];
}

// --- REUSABLE UI COMPONENTS ---

const FormInput = ({ label, name, value, onChange, placeholder = '', type = 'text', required = false }: any) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            type={type}
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
    </div>
);

const InfoItem = ({ label, value }: { label: string; value: React.ReactNode; }) => (
    <div>
        <label className="block text-sm font-medium text-gray-500">{label}</label>
        <p className="text-sm text-gray-900 break-words">{value || 'N/A'}</p>
    </div>
);

const CardHeader = ({ title, icon, onAdd, onEdit }: { title: string; icon: React.ReactElement; onAdd?: () => void; onEdit?: () => void; }) => (
    <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h2 className="text-l font-bold text-[#1F4A75] flex items-center gap-3">
            {React.cloneElement(icon, { className: "w-5 h-5" })} {title}
        </h2>
        <div>
            {onAdd && <button onClick={onAdd} className="flex items-center gap-2 text-sm text-[#1F4A75] font-semibold p-2 rounded-lg hover:bg-gray-100"><Plus size={16} />Add</button>}
            {onEdit && <button onClick={onEdit} className="flex items-center gap-2 text-sm text-[#1F4A75] font-semibold p-2 rounded-lg hover:bg-gray-100"><Pencil size={16} />Edit</button>}
        </div>
    </div>
);


// --- MAIN PAGE COMPONENT ---
export default function CompanyProfilePage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>(); // Get ID from URL
    const orgId = id ? parseInt(id, 10) : null;

    const [profile, setProfile] = React.useState<OrganizationData | null>(null);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [error, setError] = React.useState<string | null>(null);
    const [modalConfig, setModalConfig] = React.useState<{ mode: 'create' | 'edit'; modelType: ModelType; data?: any; } | null>(null);
    const [toast, setToast] = React.useState<{ message: string, type: 'success' | 'error' } | null>(null);

    // --- DATA FETCHING ---
    React.useEffect(() => {
        const fetchData = async (currentOrgId: number) => {
            setLoading(true);
            try {
                const response = await api.getOrganizationFull(currentOrgId);
                setProfile(response.data);
                setError(null);
            } catch (err: any) {
                setError(err.response?.data?.detail || "Failed to fetch organization data.");
                console.error("Fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        if (orgId) {
            fetchData(orgId);
        } else {
            setLoading(false);
        }
    }, [orgId]);

    // --- TOAST NOTIFICATION ---
    React.useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);


    // --- CRUD HANDLERS ---
    const handleSave = async (modelType: ModelType, itemData: any) => {
        if (!orgId) return;
        try {
            if (modalConfig?.mode === 'create') {
                await api.createItem(modelType, orgId, itemData);
                setToast({ message: `${modelType.replace(/_/g, ' ')} created successfully!`, type: 'success' });
            } else {
                await api.updateItem(modelType, itemData.id, itemData);
                setToast({ message: `${modelType.replace(/_/g, ' ')} updated successfully!`, type: 'success' });
            }
            setModalConfig(null);
            const response = await api.getOrganizationFull(orgId); // Refetch data
            setProfile(response.data);
        } catch (err: any) {
            const errorMsg = err.response?.data?.detail || `Error saving ${modelType.replace(/_/g, ' ')}.`;
            setToast({ message: errorMsg, type: 'error' });
            console.error(err);
        }
    };

    const handleDelete = async (modelType: ModelType, itemId: number) => {
        if (window.confirm(`Are you sure you want to delete this ${modelType.replace(/_/g, ' ')}?`)) {
            try {
                await api.deleteItem(modelType, itemId);
                setToast({ message: 'Item deleted successfully!', type: 'success' });
                if (orgId) {
                    const response = await api.getOrganizationFull(orgId); // Refetch data
                    setProfile(response.data);
                }
            } catch (err: any) {
                setToast({ message: `Error deleting item.`, type: 'error' });
                console.error(err);
            }
        }
    };

    const handleCreateOrganization = async (orgData: CreateOrganizationData) => {
        setLoading(true);
        try {
            const response = await api.createOrganization(orgData);
            setToast({ message: 'Organization created successfully!', type: 'success' });
            setTimeout(() => {
                navigate(`/company/${response.data.id}`);
            }, 1500);
        } catch (err: any) {
            const errorMsg = err.response?.data?.detail || "Error creating organization.";
            setToast({ message: errorMsg, type: 'error' });
            setLoading(false);
        }
    };

    // --- RENDER LOGIC ---
    if (loading && !profile) { 
        return <div className="flex items-center justify-center h-screen bg-slate-50"><LoaderCircle className="animate-spin text-[#1F4A75]" size={48} /><span className="ml-4 text-lg text-gray-600">Loading...</span></div>;
    }

    if (error) {
        return <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-red-600"><div className="flex items-center"><X size={48} /><span className="ml-4 text-lg font-semibold">An Error Occurred</span></div><p className="mt-2 text-center max-w-md">{error}</p></div>;
    }

    if (!orgId) {
        return <CreateOrganizationPage onSubmit={handleCreateOrganization} loading={loading} />;
    }

    if (!profile) {
        return <div className="flex items-center justify-center h-screen bg-slate-50">Could not load profile.</div>;
    }
    
    // --- MAIN PROFILE VIEW ---
    return (
        <>
            {modalConfig && <EditModal modalConfig={modalConfig} onClose={() => setModalConfig(null)} onSave={handleSave} orgId={profile.id} />}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-50 text-white px-6 py-3 rounded-lg shadow-lg transition-opacity duration-300 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                    <p>{toast.message}</p>
                </div>
            )}
            <div className="flex bg-slate-50">
                <Sidebar />
                <div className="flex-1 p-8 h-screen overflow-y-auto">
                    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                        <CardHeader title="General Profile" icon={<Building2 />} onEdit={() => setModalConfig({ mode: 'edit', modelType: 'organization', data: profile })} />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6 pt-4">
                            <InfoItem label="Company Name" value={profile.name} />
                            <InfoItem label="Legal Entity Type" value={profile.legal_entity_type} />
                            <InfoItem label="Industry" value={profile.industry_classification} />
                            <InfoItem label="Employee Count" value={profile.employee_count?.toLocaleString()} />
                            <InfoItem label="Annual Turnover" value={profile.annual_turnover?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* SectionCard components remain unchanged */}
                        <SectionCard title="Jurisdictions" modelType="jurisdiction" icon={<Globe />} items={profile.jurisdictions} onOpenModal={setModalConfig} onDelete={handleDelete}>
                            {(j: Jurisdiction) => <span>{j.city}, {j.state}, {j.country}</span>}
                        </SectionCard>
                        <SectionCard title="Business Units" modelType="business_unit" icon={<Briefcase />} items={profile.business_units} onOpenModal={setModalConfig} onDelete={handleDelete}>
                            {(bu: BusinessUnit) => <><p className="font-semibold">{bu.name}</p><p className="text-xs text-gray-500">Head: {bu.head_name || 'N/A'}</p></>}
                        </SectionCard>
                        <SectionCard title="Licenses & Registrations" modelType="license" icon={<FileText />} items={profile.licenses} onOpenModal={setModalConfig} onDelete={handleDelete}>
                            {(lic: License) => <><p className="font-semibold">{lic.license_name}</p><p className="text-xs text-gray-500">Expires: {lic.expiry_date || 'N/A'}</p></>}
                        </SectionCard>
                        <SectionCard title="Regulators" modelType="regulator" icon={<Landmark />} items={profile.regulators} onOpenModal={setModalConfig} onDelete={handleDelete}>
                             {(reg: Regulator) => <span>{reg.name} ({reg.jurisdiction})</span>}
                        </SectionCard>
                        <SectionCard title="Standards Adopted" modelType="standard" icon={<ClipboardCheck />} items={profile.standards} onOpenModal={setModalConfig} onDelete={handleDelete}>
                            {(std: Standard) => <><p className="font-semibold">{std.name}</p><p className="text-xs text-gray-500">Valid Until: {std.valid_until || 'N/A'}</p></>}
                        </SectionCard>
                        <SectionCard title="Critical Processes" modelType="critical_process" icon={<AlertTriangle />} items={profile.critical_processes} onOpenModal={setModalConfig} onDelete={handleDelete}>
                            {(cp: CriticalProcess) => <><p className="font-semibold">{cp.name}</p><p className="text-xs text-gray-500">{cp.description}</p></>}
                        </SectionCard>
                        <SectionCard title="Third-Party Dependencies" modelType="third_party" icon={<Users />} items={profile.third_parties} onOpenModal={setModalConfig} onDelete={handleDelete}>
                            {(tp: ThirdParty) => <><p className="font-semibold">{tp.name}</p><p className="text-xs text-gray-500">{tp.service_provided}</p></>}
                        </SectionCard>
                        <SectionCard title="Compliance History" modelType="compliance_record" icon={<History />} items={profile.compliance_history} onOpenModal={setModalConfig} onDelete={handleDelete}>
                            {(ch: ComplianceRecord) => <><p className="font-semibold">{ch.record_type} ({ch.date})</p><p className="text-xs text-gray-500">{ch.description} - <strong>{ch.outcome}</strong></p></>}
                        </SectionCard>
                    </div>
                </div>
            </div>
        </>
    );
}


// --- SUB-COMPONENTS ---

const CreateOrganizationPage = ({ onSubmit, loading }: { onSubmit: (data: CreateOrganizationData) => void; loading: boolean }) => {
    const [formData, setFormData] = React.useState({
        name: '', legal_entity_type: '', industry_classification: '', 
        // --- CHANGE: Use strings for form state to allow empty inputs ---
        employee_count: '0', 
        annual_turnover: '0'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        // --- CHANGE: Directly set the string value from the input ---
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (window.confirm("Are you sure? These details cannot be changed later.")) {
            // --- CHANGE: Convert string fields back to numbers before submission ---
            // Note: Number('') correctly evaluates to 0
            const submissionData = {
                ...formData,
                employee_count: Number(formData.employee_count),
                annual_turnover: Number(formData.annual_turnover),
            };
            onSubmit(submissionData);
        }
    };

    return (
        <div className="flex bg-slate-50">
            <Sidebar />
            <div className="flex-1 p-8 h-screen overflow-y-auto">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white p-8 rounded-lg shadow-md">
                        <div className="flex items-center gap-3 mb-6"><Building2 className="w-8 h-8 text-[#1F4A75]" /><h1 className="text-xl font-bold text-[#1F4A75]">Create Organization</h1></div>
                        <p className="text-gray-600 mb-6">Please create your organization profile to get started.</p>
                        <form onSubmit={handleFormSubmit} className="space-y-6">
                            <FormInput label="Organization Name" name="name" value={formData.name} onChange={handleChange} required={true} />
                            <FormInput label="Legal Entity Type" name="legal_entity_type" value={formData.legal_entity_type} onChange={handleChange} required={true} />
                            <FormInput label="Industry Classification" name="industry_classification" value={formData.industry_classification} onChange={handleChange} />
                            {/* --- CHANGE: Removed the `|| 0` fallback from value --- */}
                            <FormInput label="Employee Count" name="employee_count" value={formData.employee_count} onChange={handleChange} type="number" />
                            <FormInput label="Annual Turnover (USD)" name="annual_turnover" value={formData.annual_turnover} onChange={handleChange} type="number" />
                            <div className="flex justify-end pt-4">
                                <button type="submit" disabled={loading || !formData.name || !formData.legal_entity_type} className="px-6 py-3 bg-[#1F4A75] text-white rounded-lg hover:bg-blue-900 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2">
                                    {loading ? (<><LoaderCircle className="animate-spin" size={16} />Creating Organization...</>) : 'Create Organization'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SectionCard = ({ title, modelType, icon, items, onOpenModal, onDelete, children }: any) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <CardHeader title={title} icon={icon} onAdd={() => onOpenModal({ mode: 'create', modelType })} />
        <div className="space-y-2 mt-4">
            {items?.length > 0 ? items.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center p-2 rounded-md hover:bg-gray-50">
                    <div>{children(item)}</div>
                    <div className="flex gap-3 flex-shrink-0 ml-4">
                        <button onClick={() => onOpenModal({ mode: 'edit', modelType, data: item })} className="text-gray-500 hover:text-blue-600"><Pencil size={16} /></button>
                        <button onClick={() => onDelete(modelType, item.id)} className="text-gray-500 hover:text-red-600"><Trash2 size={16} /></button>
                    </div>
                </div>
            )) : <p className="text-sm text-gray-500">No items added yet.</p>}
        </div>
    </div>
);

const EditModal = ({ modalConfig, onClose, onSave, orgId }: { modalConfig: any, onClose: any, onSave: any, orgId: number }) => {
    const { mode, modelType, data } = modalConfig;
    const [formData, setFormData] = React.useState<any>(data || {});

    React.useEffect(() => { setFormData(data || {}); }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        // --- CHANGE: This already correctly stores the string value ---
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // --- CHANGE: Convert number fields back to numbers on submit ---
        let submissionData = { ...formData };
        if (modelType === 'organization') {
            submissionData = {
                ...submissionData,
                employee_count: Number(submissionData.employee_count),
                annual_turnover: Number(submissionData.annual_turnover),
            };
        }
        onSave(modelType, submissionData);
    };

    const renderFormFields = () => {
        switch (modelType) {
            case 'organization':
                return <>
                    <FormInput label="Company Name" name="name" value={formData.name || ''} onChange={handleChange} />
                    <FormInput label="Legal Entity Type" name="legal_entity_type" value={formData.legal_entity_type || ''} onChange={handleChange} />
                    <FormInput label="Industry" name="industry_classification" value={formData.industry_classification || ''} onChange={handleChange} />
                    {/* --- CHANGE: Use nullish coalescing `?? ''` to handle null/undefined without affecting 0 --- */}
                    <FormInput label="Employee Count" name="employee_count" value={formData.employee_count ?? ''} onChange={handleChange} type="number"/>
                    <FormInput label="Annual Turnover" name="annual_turnover" value={formData.annual_turnover ?? ''} onChange={handleChange} type="number"/>
                </>;
            case 'jurisdiction':
                return <>
                    <FormInput label="Country" name="country" value={formData.country || ''} onChange={handleChange} />
                    <FormInput label="State" name="state" value={formData.state || ''} onChange={handleChange} />
                    <FormInput label="City" name="city" value={formData.city || ''} onChange={handleChange} />
                </>;
            // Other cases remain unchanged
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