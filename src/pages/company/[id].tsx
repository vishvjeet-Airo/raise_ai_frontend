import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/config';
import {
  Building2, Pencil, Plus, Briefcase, Trash2, X, LoaderCircle,
  Globe, FileText, Landmark, ClipboardCheck, AlertTriangle, Users, History
} from 'lucide-react';
import { Sidebar } from "@/components/Sidebar";

const ORGANISATION_API_ENDPOINT = `${API_BASE_URL}/api/organisations`;

// --- API Abstraction ---
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

type ModelType =
  | 'organization'
  | 'jurisdiction'
  | 'license'
  | 'regulator'
  | 'business_unit'
  | 'standard'
  | 'critical_process'
  | 'third_party'
  | 'compliance_record';

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

const InfoItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <label className="block text-sm font-medium text-gray-500">{label}</label>
    <p className="text-sm text-gray-900 break-words">{value || 'N/A'}</p>
  </div>
);

const CardHeader = ({
  title,
  icon,
  onAdd,
}: {
  title: string;
  icon: React.ReactElement;
  onAdd?: () => void;
}) => (
  <div className="flex justify-between items-center mb-4 border-b pb-2">
    <h2 className="text-l font-bold text-[#1F4A75] flex items-center gap-3">
      {React.cloneElement(icon, { className: "w-5 h-5" })} {title}
    </h2>
    {onAdd && (
      <button
        onClick={onAdd}
        className="flex items-center gap-2 text-sm text-[#1F4A75] font-semibold p-2 rounded-lg hover:bg-gray-100"
      >
        <Plus size={16} />
        Add
      </button>
    )}
  </div>
);

const ListItem = ({
  modelType,
  item,
  children,
  onEdit,
  onDelete,
  canEdit = false,
}: {
  modelType: ModelType;
  item: { id: number };
  children: React.ReactNode;
  onEdit: (modelType: ModelType, data: any) => void;
  onDelete: (modelType: ModelType, id: number) => void;
  canEdit?: boolean;
}) => (
  <div className="flex justify-between items-center p-2 rounded-md hover:bg-gray-50">
    <div>{children}</div>
    {canEdit && (
      <div className="flex gap-3 flex-shrink-0 ml-4">
        <button onClick={() => onEdit(modelType, item)} className="text-gray-500 hover:text-blue-600">
          <Pencil size={16} />
        </button>
        <button onClick={() => onDelete(modelType, item.id)} className="text-gray-500 hover:text-red-600">
          <Trash2 size={16} />
        </button>
      </div>
    )}
  </div>
);

const EditModal = ({
  modalConfig,
  onClose,
  onSave,
  orgId,
}: {
  modalConfig: { mode: 'create' | 'edit'; modelType: ModelType; data?: any; },
  onClose: () => void,
  onSave: (modelType: ModelType, itemData: any, orgId: number) => void,
  orgId: number
}) => {
  const { mode, modelType, data } = modalConfig;
  const [formData, setFormData] = React.useState<any>(data || {});

  React.useEffect(() => { setFormData(data || {}); }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanFormData = Object.fromEntries(
      Object.entries(formData).filter(([_, v]) => v != null && v !== '')
    );
    onSave(modelType, cleanFormData, orgId);
  };

  const FormInput = ({
    label,
    name,
    value,
    onChange,
    placeholder = '',
    type = 'text',
    required = false
  }: any) => (
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

  const renderFormFields = () => {
    switch (modelType) {
      case 'organization':
        return <>
          <FormInput label="Company Name" name="name" value={formData.name || ''} onChange={handleChange} />
          <FormInput label="Legal Entity Type" name="legal_entity_type" value={formData.legal_entity_type || ''} onChange={handleChange} />
          <FormInput label="Industry" name="industry_classification" value={formData.industry_classification || ''} onChange={handleChange} />
          <FormInput label="Employee Count" name="employee_count" value={formData.employee_count ?? ''} onChange={handleChange} type="number" />
          <FormInput label="Annual Turnover" name="annual_turnover" value={formData.annual_turnover ?? ''} onChange={handleChange} type="number" />
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
          <FormInput label="Valid Until" name="valid_until" value={formData.valid_until || ''} onChange={handleChange} placeholder="YYYY-MM-DD" type="date" />
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
          <FormInput label="Contract Expiry" name="contract_expiry" value={formData.contract_expiry || ''} onChange={handleChange} placeholder="YYYY-MM-DD" type="date" />
        </>;
      case 'compliance_record':
        return <>
          <FormInput label="Record Type" name="record_type" value={formData.record_type || ''} onChange={handleChange} placeholder="e.g., Audit, Incident" />
          <FormInput label="Description" name="description" value={formData.description || ''} onChange={handleChange} />
          <FormInput label="Date" name="date" value={formData.date || ''} onChange={handleChange} placeholder="YYYY-MM-DD" type="date" />
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

export default function CompanyProfileByIdPage() {
  const { id } = useParams<{ id: string }>();

  // Role-based permissions
  const role = (localStorage.getItem('role') || '').toLowerCase();
  const isAdmin = role === 'admin';

  const [profile, setProfile] = useState<OrganizationData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [modalConfig, setModalConfig] = useState<{ mode: 'create' | 'edit'; modelType: ModelType; data?: any; } | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await api.getOrganizationFull(parseInt(id, 10));
        setProfile(response.data);
        setError(null);
      } catch (err: any) {
        setError("Could not load company profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSave = async (modelType: ModelType, itemData: any, orgId: number) => {
    // No edits for organization from UI; guard anyway
    if (modelType === 'organization') return;
    if (!isAdmin) return;
    try {
      const dataToSend = { ...itemData };
      if (modalConfig?.mode === 'create') {
        delete dataToSend.id;
        await api.createItem(modelType, orgId, dataToSend);
      } else {
        const itemId = dataToSend.id ?? undefined;
        if (!itemId) throw new Error('Missing item ID for update operation.');
        await api.updateItem(modelType, itemId, dataToSend);
      }
      setModalConfig(null);
      if (id) {
        const response = await api.getOrganizationFull(parseInt(id, 10));
        setProfile(response.data);
      }
    } catch (err) {
      console.error(err);
      alert(`Error saving ${modelType.replace(/_/g, ' ')}.`);
    }
  };

  const handleDelete = async (modelType: ModelType, itemId: number) => {
    if (!isAdmin) return;
    if (window.confirm(`Are you sure you want to delete this ${modelType.replace(/_/g, ' ')}?`)) {
      try {
        await api.deleteItem(modelType, itemId);
        if (id) {
          const response = await api.getOrganizationFull(parseInt(id, 10));
          setProfile(response.data);
        }
      } catch (err) {
        console.error(err);
        alert(`Error deleting ${modelType.replace(/_/g, ' ')}.`);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <LoaderCircle className="animate-spin text-[#1F4A75]" size={48} />
        <span className="ml-4 text-lg text-gray-600">Loading Profile...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-red-600">
        <div className="flex items-center">
          <X size={48} />
          <span className="ml-4 text-lg font-semibold">An Error Occurred</span>
        </div>
        <p className="mt-2 text-center max-w-md">{error}</p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <>
      {isAdmin && modalConfig && profile && (
        <EditModal
          modalConfig={modalConfig}
          onClose={() => setModalConfig(null)}
          onSave={handleSave}
          orgId={profile.id}
        />
      )}

      <div className="flex bg-slate-50">
        <Sidebar />
        <div className="flex-1 p-8 h-screen overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-xl font-bold text-gray-500">Company Profile</h1>
          </div>

          {/* General Profile (read-only) */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-l font-bold text-[#1F4A75] flex items-center gap-3">
                {React.cloneElement(<Building2 />, { className: "w-5 h-5" })} General Profile
              </h2>
              {/* No edit button even for admin */}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 align-center gap-x-8 gap-y-6 pt-4">
              <InfoItem label="Company Name" value={profile.name} />
              <InfoItem label="Legal Entity Type" value={profile.legal_entity_type} />
              <InfoItem label="Industry" value={profile.industry_classification} />
              <InfoItem label="Employee Count" value={profile.employee_count?.toLocaleString()} />
              <InfoItem
                label="Annual Turnover"
                value={profile.annual_turnover?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
              />
            </div>
          </div>

          <div className="flex flex-col gap-8">
            {/* Jurisdictions */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <CardHeader
                title="Jurisdictions"
                icon={<Globe />}
                onAdd={isAdmin ? () => setModalConfig({ mode: 'create', modelType: 'jurisdiction' }) : undefined}
              />
              {profile.jurisdictions?.length ? (
                profile.jurisdictions.map(j => (
                  <ListItem
                    key={j.id}
                    modelType="jurisdiction"
                    item={j}
                    onEdit={(mt, data) => setModalConfig({ mode: 'edit', modelType: mt, data })}
                    onDelete={handleDelete}
                    canEdit={isAdmin}
                  >
                    <span>{[j.city, j.state, j.country].filter(Boolean).join(", ")}</span>
                  </ListItem>
                ))
              ) : (
                <p className="text-gray-400">No jurisdictions added.</p>
              )}
            </div>

            {/* Business Units */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <CardHeader
                title="Business Units"
                icon={<Briefcase />}
                onAdd={isAdmin ? () => setModalConfig({ mode: 'create', modelType: 'business_unit' }) : undefined}
              />
              {profile.business_units?.length ? (
                profile.business_units.map(bu => (
                  <ListItem
                    key={bu.id}
                    modelType="business_unit"
                    item={bu}
                    onEdit={(mt, data) => setModalConfig({ mode: 'edit', modelType: mt, data })}
                    onDelete={handleDelete}
                    canEdit={isAdmin}
                  >
                    <>
                      <p className="font-semibold">{bu.name}</p>
                      <p className="text-xs text-gray-500">Head: {bu.head_name || 'N/A'}</p>
                    </>
                  </ListItem>
                ))
              ) : (
                <p className="text-gray-400">No business units added.</p>
              )}
            </div>

            {/* Licenses */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <CardHeader
                title="Licenses & Registrations"
                icon={<FileText />}
                onAdd={isAdmin ? () => setModalConfig({ mode: 'create', modelType: 'license' }) : undefined}
              />
              {profile.licenses?.length ? (
                profile.licenses.map(lic => (
                  <ListItem
                    key={lic.id}
                    modelType="license"
                    item={lic}
                    onEdit={(mt, data) => setModalConfig({ mode: 'edit', modelType: mt, data })}
                    onDelete={handleDelete}
                    canEdit={isAdmin}
                  >
                    <>
                      <p className="font-semibold">{lic.license_name}</p>
                      <p className="text-xs text-gray-500">Expires: {lic.expiry_date || 'N/A'}</p>
                    </>
                  </ListItem>
                ))
              ) : (
                <p className="text-gray-400">No licenses added.</p>
              )}
            </div>

            {/* Regulators */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <CardHeader
                title="Regulators"
                icon={<Landmark />}
                onAdd={isAdmin ? () => setModalConfig({ mode: 'create', modelType: 'regulator' }) : undefined}
              />
              {profile.regulators?.length ? (
                profile.regulators.map(reg => (
                  <ListItem
                    key={reg.id}
                    modelType="regulator"
                    item={reg}
                    onEdit={(mt, data) => setModalConfig({ mode: 'edit', modelType: mt, data })}
                    onDelete={handleDelete}
                    canEdit={isAdmin}
                  >
                    <span>{reg.name}{reg.jurisdiction ? ` (${reg.jurisdiction})` : ''}</span>
                  </ListItem>
                ))
              ) : (
                <p className="text-gray-400">No regulators added.</p>
              )}
            </div>

            {/* Standards */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <CardHeader
                title="Standards Adopted"
                icon={<ClipboardCheck />}
                onAdd={isAdmin ? () => setModalConfig({ mode: 'create', modelType: 'standard' }) : undefined}
              />
              {profile.standards?.length ? (
                profile.standards.map(std => (
                  <ListItem
                    key={std.id}
                    modelType="standard"
                    item={std}
                    onEdit={(mt, data) => setModalConfig({ mode: 'edit', modelType: mt, data })}
                    onDelete={handleDelete}
                    canEdit={isAdmin}
                  >
                    <>
                      <p className="font-semibold">{std.name}</p>
                      <p className="text-xs text-gray-500">Valid Until: {std.valid_until || 'N/A'}</p>
                    </>
                  </ListItem>
                ))
              ) : (
                <p className="text-gray-400">No standards added.</p>
              )}
            </div>

            {/* Critical Processes */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <CardHeader
                title="Critical Processes"
                icon={<AlertTriangle />}
                onAdd={isAdmin ? () => setModalConfig({ mode: 'create', modelType: 'critical_process' }) : undefined}
              />
              {profile.critical_processes?.length ? (
                profile.critical_processes.map(cp => (
                  <ListItem
                    key={cp.id}
                    modelType="critical_process"
                    item={cp}
                    onEdit={(mt, data) => setModalConfig({ mode: 'edit', modelType: mt, data })}
                    onDelete={handleDelete}
                    canEdit={isAdmin}
                  >
                    <>
                      <p className="font-semibold">{cp.name}</p>
                      <p className="text-xs text-gray-500">{cp.description}</p>
                    </>
                  </ListItem>
                ))
              ) : (
                <p className="text-gray-400">No critical processes added.</p>
              )}
            </div>

            {/* Third Parties */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <CardHeader
                title="Third-Party Dependencies"
                icon={<Users />}
                onAdd={isAdmin ? () => setModalConfig({ mode: 'create', modelType: 'third_party' }) : undefined}
              />
              {profile.third_parties?.length ? (
                profile.third_parties.map(tp => (
                  <ListItem
                    key={tp.id}
                    modelType="third_party"
                    item={tp}
                    onEdit={(mt, data) => setModalConfig({ mode: 'edit', modelType: mt, data })}
                    onDelete={handleDelete}
                    canEdit={isAdmin}
                  >
                    <>
                      <p className="font-semibold">{tp.name}</p>
                      <p className="text-xs text-gray-500">{tp.service_provided}</p>
                    </>
                  </ListItem>
                ))
              ) : (
                <p className="text-gray-400">No third-party dependencies added.</p>
              )}
            </div>

            {/* Compliance History */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <CardHeader
                title="Compliance History"
                icon={<History />}
                onAdd={isAdmin ? () => setModalConfig({ mode: 'create', modelType: 'compliance_record' }) : undefined}
              />
              {profile.compliance_history?.length ? (
                profile.compliance_history.map(ch => (
                  <ListItem
                    key={ch.id}
                    modelType="compliance_record"
                    item={ch}
                    onEdit={(mt, data) => setModalConfig({ mode: 'edit', modelType: mt, data })}
                    onDelete={handleDelete}
                    canEdit={isAdmin}
                  >
                    <>
                      <p className="font-semibold">{ch.record_type} ({ch.date})</p>
                      <p className="text-xs text-gray-500">
                        {ch.description} {ch.outcome ? <>- <strong>{ch.outcome}</strong></> : null}
                      </p>
                    </>
                  </ListItem>
                ))
              ) : (
                <p className="text-gray-400">No compliance records found.</p>
              )}
            </div>
          </div>
        </div>
    </div>
    </>
  );
}