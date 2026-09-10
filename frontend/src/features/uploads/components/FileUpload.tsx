import { useState, useRef, useCallback } from "react";
import { Upload, X, File, Image, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { uploadFiles } from "../api/uploadsApi";
import type { UploadedFile } from "../api/uploadsApi";

const MAX_FILES = 5;
const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

interface FileUploadProps {
  module?: string;
  onUploadComplete?: (files: UploadedFile[]) => void;
  accept?: string;
  maxFiles?: number;
  maxSize?: number;
  disabled?: boolean;
  refId?: number;
}

export default function FileUpload({
  module = "general",
  onUploadComplete,
  accept = ".jpg,.jpeg,.png,.webp,.pdf",
  maxFiles = MAX_FILES,
  maxSize = MAX_SIZE,
  disabled = false,
  refId,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `"${file.name}" no es un formato válido (solo JPG, PNG, WebP, PDF)`;
    }
    if (file.size > maxSize) {
      const mb = (file.size / (1024 * 1024)).toFixed(1);
      return `"${file.name}" excede el tamaño máximo de ${maxSize / (1024 * 1024)} MB (${mb} MB)`;
    }
    return null;
  };

  const handleSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const incoming = Array.from(e.target.files || []);
    const total = selectedFiles.length + incoming.length;
    if (total > maxFiles) {
      setError(`Máximo ${maxFiles} archivos por subida (ya tenés ${selectedFiles.length} seleccionados)`);
      return;
    }
    for (const f of incoming) {
      const err = validateFile(f);
      if (err) {
        setError(err);
        return;
      }
    }
    setSelectedFiles((prev) => [...prev, ...incoming]);
    if (inputRef.current) inputRef.current.value = "";
  }, [selectedFiles.length, maxFiles, maxSize]);

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setError(null);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const result = await uploadFiles(selectedFiles, module, refId);
      setSelectedFiles([]);
      onUploadComplete?.(result);
    } catch (err: any) {
      setError(err.message || "Error al subir archivos");
    } finally {
      setUploading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isImage = (type: string) => type.startsWith("image/");

  return (
    <div className="flex flex-col gap-3">
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          onChange={handleSelect}
          disabled={disabled || uploading}
          className="hidden"
        />
        <Upload className="size-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">
          Hacé clic o arrastrá archivos acá
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          {accept} · hasta {maxFiles} archivos · máx {maxSize / (1024 * 1024)} MB c/u
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {selectedFiles.length > 0 && (
        <div className="flex flex-col gap-2">
          {selectedFiles.map((file, i) => (
            <div key={`${file.name}-${i}`} className="flex items-center gap-2 bg-muted/50 rounded px-3 py-2 text-sm">
              {isImage(file.type) ? (
                <Image className="size-4 shrink-0 text-muted-foreground" />
              ) : (
                <File className="size-4 shrink-0 text-muted-foreground" />
              )}
              <span className="truncate flex-1">{file.name}</span>
              <span className="text-xs text-muted-foreground shrink-0">{formatSize(file.size)}</span>
              <button onClick={() => removeFile(i)} className="text-destructive hover:text-destructive/80 shrink-0" disabled={uploading}>
                <X className="size-4" />
              </button>
            </div>
          ))}
          <Button onClick={handleUpload} disabled={uploading} size="sm" className="self-end">
            {uploading ? "Subiendo..." : `Subir ${selectedFiles.length} archivo${selectedFiles.length > 1 ? "s" : ""}`}
          </Button>
        </div>
      )}
    </div>
  );
}
