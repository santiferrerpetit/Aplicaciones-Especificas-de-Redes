import { apiFetch } from "@/lib/api";

export type UploadedFile = {
  id: number;
  originalName: string;
  storedName: string;
  mimeType: string;
  size: number;
  module: string;
  refId: number | null;
  url: string;
  uploadedById: number | null;
  createdAt: string;
};

export async function uploadFiles(files: File[], module: string = "general", refId?: number): Promise<UploadedFile[]> {
  const formData = new FormData();
  files.forEach((f) => formData.append("files", f));
  if (refId) formData.append("refId", String(refId));
  return apiFetch<UploadedFile[]>(`/api/uploads/${module}`, {
    method: "POST",
    body: formData,
  });
}

export async function listFiles(module?: string): Promise<UploadedFile[]> {
  const params = module ? `?module=${module}` : "";
  return apiFetch<UploadedFile[]>(`/api/uploads${params}`);
}

export async function deleteFile(id: number): Promise<void> {
  return apiFetch(`/api/uploads/${id}`, { method: "DELETE" });
}
