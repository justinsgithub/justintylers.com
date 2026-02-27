"use client";

import { useCallback, useMemo, useRef } from "react";
import type { Value } from "platejs";
import { BaseImagePlugin } from "@platejs/media";
import { Plate, usePlateEditor } from "platejs/react";

import { BaseEditorKit } from "@/components/editor/editor-base-kit";
import { EditorUploadProvider } from "@/components/editor/editor-upload-context";
import { FixedToolbarKit } from "@/components/editor/plugins/fixed-toolbar-kit";
import { useArticleImageUpload } from "@/lib/hooks/use-article-image-upload";
import { Editor, EditorContainer } from "@/components/ui/editor";
import { TooltipProvider } from "@/components/ui/tooltip";

interface ArticleEditorProps {
  initialValue?: Value;
  onChange?: (value: Value) => void;
}

export function ArticleEditor({ initialValue, onChange }: ArticleEditorProps) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const handleChange = useCallback(({ value }: { value: Value }) => {
    onChangeRef.current?.(value);
  }, []);

  const uploadFile = useArticleImageUpload();

  // Stable ref so the plugin closure always has the latest upload function
  const uploadRef = useRef(uploadFile);
  uploadRef.current = uploadFile;

  const plugins = useMemo(() => {
    // Override BaseImagePlugin with uploadImage for paste/drag support
    const imagePluginWithUpload = BaseImagePlugin.configure({
      options: {
        uploadImage: async (
          dataUrl: ArrayBuffer | string
        ): Promise<string> => {
          // Convert dataUrl to a File for upload
          const response = await fetch(dataUrl as string);
          const blob = await response.blob();
          const file = new File([blob], "pasted-image.png", {
            type: blob.type || "image/png",
          });
          return uploadRef.current(file);
        },
      },
    });

    // Replace BaseImagePlugin in the kit with our configured version
    const editorKit = BaseEditorKit.map((plugin) =>
      plugin.key === "img" ? imagePluginWithUpload : plugin
    );

    return [...FixedToolbarKit, ...editorKit];
  }, []);

  const editor = usePlateEditor({
    plugins,
    value: initialValue,
  });

  return (
    <TooltipProvider>
      <EditorUploadProvider value={uploadFile}>
        <Plate editor={editor} onChange={handleChange}>
          <EditorContainer
            variant="default"
            className="rounded-lg border border-border bg-card"
          >
            <Editor
              variant="fullWidth"
              placeholder="Start writing your article..."
            />
          </EditorContainer>
        </Plate>
      </EditorUploadProvider>
    </TooltipProvider>
  );
}
