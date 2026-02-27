"use client";

import { useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function useArticleImageUpload() {
  const generateUploadUrl = useMutation(api.articles.generateUploadUrl);
  const getFileUrl = useMutation(api.articles.getFileUrl);

  return useCallback(
    async (file: File): Promise<string> => {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();
      const url = await getFileUrl({ storageId });
      if (!url) throw new Error("Failed to get file URL");
      return url;
    },
    [generateUploadUrl, getFileUrl]
  );
}
