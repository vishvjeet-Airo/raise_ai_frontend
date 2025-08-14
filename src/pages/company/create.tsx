import React, { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/config';
import { Building2, LoaderCircle } from 'lucide-react';
import { Sidebar } from "@/components/Sidebar";

const ORGANISATION_API_ENDPOINT = `${API_BASE_URL}/api/organisation`;

interface CreateOrganizationData {
    name: string;
    legal_entity_type: string;
    industry_classification?: string;
    employee_count?: number;
    annual_turnover?: number;
}

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

export default function CreateOrganizationPage() {
    const router = useRouter();
    const [formData, setFormData] = useState<CreateOrganizationData>({
        name: '',
        legal_entity_type: '',
        industry_classification: '',
        employee_count: 0,
        annual_turnover: 0
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? (value === '' ? 0 : Number(value)) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post<{ id: number }>(
                `${ORGANISATION_API_ENDPOINT}/organization/create`,
                formData
            );
            router.push(`/company/${response.data.id}`);
        } catch (err: any) {
            alert(err.response?.data?.detail || "Error creating organization.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex bg-slate-50">
            <Sidebar />
            <div className="flex-1 p-8 h-screen overflow-y-auto">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white p-8 rounded-lg shadow-md">
                        <div className="flex items-center gap-3 mb-6">
                            <Building2 className="w-8 h-8 text-[#1F4A75]" />
                            <h1 className="text-xl font-bold text-[#1F4A75]">Create Organization</h1>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Please create your organization profile to get started.
                        </p>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <FormInput
                                label="Organization Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter organization name"
                                required={true}
                            />
                            <FormInput
                                label="Legal Entity Type"
                                name="legal_entity_type"
                                value={formData.legal_entity_type}
                                onChange={handleChange}
                                placeholder="e.g., Corporation, LLC, Partnership"
                                required={true}
                            />
                            <FormInput
                                label="Industry Classification"
                                name="industry_classification"
                                value={formData.industry_classification || ''}
                                onChange={handleChange}
                                placeholder="e.g., Technology, Healthcare, Finance"
                            />
                            <FormInput
                                label="Employee Count"
                                name="employee_count"
                                value={formData.employee_count || 0}
                                onChange={handleChange}
                                type="number"
                                placeholder="0"
                            />
                            <FormInput
                                label="Annual Turnover (USD)"
                                name="annual_turnover"
                                value={formData.annual_turnover || 0}
                                onChange={handleChange}
                                type="number"
                                placeholder="0"
                            />
                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    disabled={loading || !formData.name || !formData.legal_entity_type}
                                    className="px-6 py-3 bg-[#1F4A75] text-white rounded-lg hover:bg-blue-900 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <LoaderCircle className="animate-spin" size={16} />
                                            Creating...
                                        </>
                                    ) : (
                                        'Create Organization'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}