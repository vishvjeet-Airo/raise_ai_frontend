/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

export const uploadDocument = async (file: File, name: string) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("name", name);

  const response = await fetch("http://localhost:8000/api/documents/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload document");
  }

  return response.json();
};
