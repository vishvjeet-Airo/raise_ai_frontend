import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/config';
import {
    Building2, Pencil, Plus, Briefcase, Trash2, X, LoaderCircle,
    Globe, FileText, Landmark, ClipboardCheck, AlertTriangle, Users, History
} from 'lucide-react';
import { Sidebar } from "@/components/Sidebar";

const ORGANISATION_API_ENDPOINT = `${API_BASE_URL}/api/organisation`;

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

const CardHeader = ({ title, icon }: { title: string; icon: React.ReactElement }) => (
    <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h2 className="text-l font-bold text-[#1F4A75] flex items-center gap-3">
            {React.cloneElement(icon, { className: "w-5 h-5" })} {title}
        </h2>
    </div>
);

export default function CompanyProfileByIdPage() {
    const { id } = useParams<{ id: string }>();
    const [profile, setProfile] = useState<OrganizationData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await axios.get<OrganizationData>(`${ORGANISATION_API_ENDPOINT}/organization/${id}/full`);
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

    if (loading) {
        return <div className="flex items-center justify-center h-screen bg-slate-50"><LoaderCircle className="animate-spin text-[#1F4A75]" size={48} /><span className="ml-4 text-lg text-gray-600">Loading Profile...</span></div>;
    }

    if (error) {
        return <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-red-600"><div className="flex items-center"><X size={48} /><span className="ml-4 text-lg font-semibold">An Error Occurred</span></div><p className="mt-2 text-center max-w-md">{error}</p></div>;
    }

    if (!profile) return null;

    return (
        <div className="flex bg-slate-50">
            <Sidebar />
            <div className="flex-1 p-8 h-screen overflow-y-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-xl font-bold text-gray-500">Company Profile</h1>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h2 className="text-l font-bold text-[#1F4A75] flex items-center gap-3">
                            {React.cloneElement(<Building2 />, { className: "w-5 h-5" })} General Profile
                        </h2>
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
                        <CardHeader title="Jurisdictions" icon={<Globe />} />
                        {profile.jurisdictions?.length ? profile.jurisdictions.map(j => (
                            <div key={j.id}><span>{j.city}, {j.state}, {j.country}</span></div>
                        )) : <p className="text-gray-400">No jurisdictions added.</p>}
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <CardHeader title="Business Units" icon={<Briefcase />} />
                        {profile.business_units?.length ? profile.business_units.map(bu => (
                            <div key={bu.id}><p className="font-semibold">{bu.name}</p><p className="text-xs text-gray-500">Head: {bu.head_name || 'N/A'}</p></div>
                        )) : <p className="text-gray-400">No business units added.</p>}
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <CardHeader title="Licenses & Registrations" icon={<FileText />} />
                        {profile.licenses?.length ? profile.licenses.map(lic => (
                            <div key={lic.id}><p className="font-semibold">{lic.license_name}</p><p className="text-xs text-gray-500">Expires: {lic.expiry_date || 'N/A'}</p></div>
                        )) : <p className="text-gray-400">No licenses added.</p>}
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <CardHeader title="Regulators" icon={<Landmark />} />
                        {profile.regulators?.length ? profile.regulators.map(reg => (
                            <div key={reg.id}><span>{reg.name} ({reg.jurisdiction})</span></div>
                        )) : <p className="text-gray-400">No regulators added.</p>}
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <CardHeader title="Standards Adopted" icon={<ClipboardCheck />} />
                        {profile.standards?.length ? profile.standards.map(std => (
                            <div key={std.id}><p className="font-semibold">{std.name}</p><p className="text-xs text-gray-500">Valid Until: {std.valid_until || 'N/A'}</p></div>
                        )) : <p className="text-gray-400">No standards added.</p>}
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <CardHeader title="Critical Processes" icon={<AlertTriangle />} />
                        {profile.critical_processes?.length ? profile.critical_processes.map(cp => (
                            <div key={cp.id}><p className="font-semibold">{cp.name}</p><p className="text-xs text-gray-500">{cp.description}</p></div>
                        )) : <p className="text-gray-400">No critical processes added.</p>}
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <CardHeader title="Third-Party Dependencies" icon={<Users />} />
                        {profile.third_parties?.length ? profile.third_parties.map(tp => (
                            <div key={tp.id}><p className="font-semibold">{tp.name}</p><p className="text-xs text-gray-500">{tp.service_provided}</p></div>
                        )) : <p className="text-gray-400">No third-party dependencies added.</p>}
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <CardHeader title="Compliance History" icon={<History />} />
                        {profile.compliance_history?.length ? profile.compliance_history.map(ch => (
                            <div key={ch.id}><p className="font-semibold">{ch.record_type} ({ch.date})</p><p className="text-xs text-gray-500">{ch.description} - <strong>{ch.outcome}</strong></p></div>
                        )) : <p className="text-gray-400">No compliance records added.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}