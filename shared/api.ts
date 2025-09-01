import { apiClient } from "@/lib/apiClient";

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
  const response = await apiClient.uploadFile("/api/documents/upload", file, { name });

  if (!response.ok) {
    throw new Error("Failed to upload document");
  }

  return response.json();
};
