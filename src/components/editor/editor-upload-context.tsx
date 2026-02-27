"use client";

import { createContext, useContext } from "react";

const EditorUploadContext = createContext<
  ((file: File) => Promise<string>) | null
>(null);

export const EditorUploadProvider = EditorUploadContext.Provider;
export const useEditorUpload = () => useContext(EditorUploadContext);
