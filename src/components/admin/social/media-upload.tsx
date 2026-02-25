"use client";

import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface MediaUploadProps {
  draftId: Id<"socialDrafts">;
  mediaIds: Id<"_storage">[];
}

export function MediaUpload({ draftId, mediaIds }: MediaUploadProps) {
  const mediaUrls = useQuery(
    api.socialDrafts.getMediaUrls,
    mediaIds.length > 0 ? { storageIds: mediaIds } : "skip"
  );
  const generateUploadUrl = useMutation(api.socialDrafts.generateUploadUrl);
  const attachMedia = useMutation(api.socialDrafts.attachMedia);
  const removeMedia = useMutation(api.socialDrafts.removeMedia);
  const deleteMedia = useMutation(api.socialDrafts.deleteMedia);

  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(
    async (files: FileList) => {
      setUploading(true);
      try {
        for (const file of Array.from(files)) {
          if (!file.type.startsWith("image/")) {
            toast.error(`${file.name} is not an image`);
            continue;
          }
          const uploadUrl = await generateUploadUrl();
          const result = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": file.type },
            body: file,
          });
          const { storageId } = await result.json();
          await attachMedia({ id: draftId, storageId });
        }
        toast.success("Uploaded");
      } catch {
        toast.error("Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [draftId, generateUploadUrl, attachMedia]
  );

  const handleRemove = async (storageId: Id<"_storage">) => {
    try {
      await removeMedia({ id: draftId, storageId });
      await deleteMedia({ storageId });
      toast.success("Removed");
    } catch {
      toast.error("Failed to remove");
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        handleUpload(e.dataTransfer.files);
      }
    },
    [handleUpload]
  );

  return (
    <div className="space-y-2">
      {mediaIds.length > 0 && mediaUrls && (
        <div className="grid grid-cols-2 gap-2">
          {mediaIds.map((id) => {
            const url = mediaUrls[id];
            if (!url) return null;
            return (
              <div
                key={id}
                className="group relative aspect-square overflow-hidden rounded-lg border border-border"
              >
                <img
                  src={url}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <button
                  onClick={() => handleRemove(id)}
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 transition-colors ${
          dragOver
            ? "border-primary/50 bg-primary/5"
            : "border-border text-muted-foreground hover:border-primary/30"
        }`}
      >
        {uploading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            <ImagePlus className="mb-1 h-5 w-5" />
            <span className="text-xs">Drop or click to upload</span>
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleUpload(e.target.files);
            e.target.value = "";
          }
        }}
      />
    </div>
  );
}
