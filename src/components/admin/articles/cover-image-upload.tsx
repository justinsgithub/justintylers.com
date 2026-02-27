"use client";

import { useCallback, useRef, useState } from "react";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { useArticleImageUpload } from "@/lib/hooks/use-article-image-upload";
import { toast } from "sonner";
import Image from "next/image";

interface CoverImageUploadProps {
  image: string | undefined;
  onChange: (url: string | undefined) => void;
}

export function CoverImageUpload({ image, onChange }: CoverImageUploadProps) {
  const uploadImage = useArticleImageUpload();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("File must be an image");
        return;
      }
      setUploading(true);
      try {
        const url = await uploadImage(file);
        onChange(url);
      } catch {
        toast.error("Failed to upload image");
      } finally {
        setUploading(false);
      }
    },
    [uploadImage, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      e.target.value = "";
    },
    [handleFile]
  );

  if (image) {
    return (
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Cover Image
        </label>
        <div className="relative overflow-hidden rounded-md border border-border">
          <Image
            src={image}
            alt="Cover"
            width={400}
            height={225}
            className="w-full object-cover"
          />
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white transition-colors hover:bg-black/80"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">
        Cover Image
      </label>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        disabled={uploading}
        className={`flex w-full flex-col items-center gap-2 rounded-md border-2 border-dashed p-6 text-sm transition-colors ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
        } ${uploading ? "pointer-events-none opacity-60" : ""}`}
      >
        {uploading ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : (
          <ImagePlus className="h-6 w-6" />
        )}
        <span>{uploading ? "Uploading..." : "Upload cover image"}</span>
        <span className="text-xs text-muted-foreground/60">Recommended: 1200 x 630px</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  );
}
