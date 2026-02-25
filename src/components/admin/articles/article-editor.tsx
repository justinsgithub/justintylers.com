"use client";

import { useCallback, useRef } from "react";
import type { Value } from "platejs";
import { Plate, usePlateEditor } from "platejs/react";

import { BaseEditorKit } from "@/components/editor/editor-base-kit";
import { FixedToolbarKit } from "@/components/editor/plugins/fixed-toolbar-kit";
import { Editor, EditorContainer } from "@/components/ui/editor";

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

  const editor = usePlateEditor({
    plugins: [...FixedToolbarKit, ...BaseEditorKit],
    value: initialValue,
  });

  return (
    <Plate editor={editor} onChange={handleChange}>
      <EditorContainer variant="default" className="rounded-lg border border-border bg-card">
        <Editor variant="fullWidth" placeholder="Start writing your article..." />
      </EditorContainer>
    </Plate>
  );
}
