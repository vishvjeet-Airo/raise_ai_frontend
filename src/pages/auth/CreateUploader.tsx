import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
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
    organisation: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // --- FIX STARTS HERE ---
      // 1. Create a payload object with the correct key and data type
      const payload = {
        username: formData.username,
        password: formData.password,
        organisation_id: parseInt(formData.organisation, 10), // Convert to number and use correct key
      };

      if (isNaN(payload.organisation_id)) {
        throw new Error("Organisation ID must be a valid number.");
      }


      const response = await fetch(`${API_BASE_URL}/api/users/create-uploader`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
        },
        // 3. Send the corrected payload
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Use .text() for more robust error handling in case the error isn't JSON
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
        organisation: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.username && formData.password && formData.organisation;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1">
        <div className="p-8">
          <div className="max-w-md mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Uploader</h2>
              <p className="text-gray-600">Add a new uploader to your system with access to upload documents.</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Uploader Information</CardTitle>
                <CardDescription>
                  Please fill in the details for the new uploader account.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username (Email)</Label>
                      <Input
                        id="username"
                        name="username"
                        type="email" // Use type="email" for better validation
                        value={formData.username}
                        onChange={handleInputChange}
                        placeholder="e.g., user@example.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Enter password"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="organisation">Organisation ID</Label>
                      <Input
                        id="organisation"
                        name="organisation"
                        type="number" // Use type="number" for better user experience
                        value={formData.organisation}
                        onChange={handleInputChange}
                        placeholder="Enter organisation ID"
                        required
                      />
                    </div>
                  </div>

                  {success && (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        Uploader created successfully!
                      </AlertDescription>
                    </Alert>
                  )}

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      disabled={!isFormValid || loading}
                      className="flex-1 md:flex-none"
                    >
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
                          organisation: "",
                        });
                        setError(null);
                        setSuccess(false);
                      }}
                      disabled={loading}
                      className="flex-1 md:flex-none"
                    >
                      Clear Form
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}