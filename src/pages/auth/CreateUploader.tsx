import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Loader2, Mail, Lock, Building2, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { API_BASE_URL } from "@/lib/config";

interface CreateUploaderFormData {
  username: string;
  password: string;
  organisation: string;
}

export default function CreateUploader() {
  const [formData, setFormData] = useState<CreateUploaderFormData>({
    username: "",
    password: "",
    organisation: localStorage.getItem("organisation_id") || "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Lock organisation field to localStorage value
    if (name === "organisation") return;
    setFormData(prev => ({
      ...prev,
      [name]: value.trimStart(),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const orgFromStorage = localStorage.getItem("organisation_id") || formData.organisation;
      const payload = {
        username: formData.username.trim(),
        password: formData.password,
        organisation_id: parseInt(orgFromStorage, 10),
      };

      if (!payload.username) throw new Error("Username is required.");
      if (!payload.password) throw new Error("Password is required.");
      if (isNaN(payload.organisation_id)) throw new Error("Organisation ID not found in your session.");

      const response = await fetch(`${API_BASE_URL}/api/users/create-uploader`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.detail || "Failed to create uploader");
        } catch {
          throw new Error(errorText || "Failed to create uploader");
        }
      }

      setSuccess(true);
      setFormData({
        username: "",
        password: "",
        organisation: localStorage.getItem("organisation_id") || "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = !!(formData.username && formData.password && formData.organisation);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-xl mx-auto">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3 border-b bg-gradient-to-r from-[#F7FAFF] to-white rounded-t-xl">
              <CardTitle className="text-xl font-bold text-[#0F2353]">Create Uploader</CardTitle>
              <CardDescription className="text-slate-600">
                Add a new uploader who can upload documents for your organisation.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              {success && (
                <Alert className="mb-6 border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Uploader created successfully.
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Username */}
                <div className="space-y-2">
                  <Label htmlFor="username">Username (Email)</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="username"
                      name="username"
                      type="email"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="e.g., user@example.com"
                      required
                      disabled={loading}
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter a secure password"
                      required
                      disabled={loading}
                      className="pl-9 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Organisation (prefilled and locked) */}
                <div className="space-y-2">
                  <Label htmlFor="organisation">Organisation ID</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="organisation"
                      name="organisation"
                      type="number"
                      value={formData.organisation}
                      onChange={handleInputChange}
                      placeholder="Organisation not found"
                      required
                      disabled
                      readOnly
                      className="pl-9 bg-slate-100 text-slate-700 cursor-not-allowed"
                      title="This value is locked to your current organisation"
                    />
                  </div>
                  
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button type="submit" disabled={!isFormValid || loading} className="sm:flex-1">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Uploader"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setFormData({
                        username: "",
                        password: "",
                        organisation: localStorage.getItem("organisation_id") || "",
                      });
                      setError(null);
                      setSuccess(false);
                    }}
                    disabled={loading}
                    className="sm:flex-1"
                  >
                    Clear
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      </div>
  );
}