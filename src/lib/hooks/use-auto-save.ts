"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export type SaveStatus = "idle" | "unsaved" | "saving" | "saved";

/**
 * Auto-saves with debounce. Increment `changeKey` on every edit to reset the timer.
 * Pass 0 for changeKey when content hasn't been modified (no auto-save will fire).
 */
export function useAutoSave(
  changeKey: number,
  saveFn: () => Promise<void>,
  debounceMs = 3000
) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const saveFnRef = useRef(saveFn);
  saveFnRef.current = saveFn;

  useEffect(() => {
    if (changeKey === 0) return;

    setStatus("unsaved");

    if (timerRef.current) clearTimeout(timerRef.current);
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);

    timerRef.current = setTimeout(async () => {
      setStatus("saving");
      try {
        await saveFnRef.current();
        setStatus("saved");
        savedTimerRef.current = setTimeout(() => setStatus("idle"), 2000);
      } catch {
        setStatus("unsaved");
      }
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [changeKey, debounceMs]);

  const saveNow = useCallback(async () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);

    setStatus("saving");
    try {
      await saveFnRef.current();
      setStatus("saved");
      savedTimerRef.current = setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("unsaved");
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    };
  }, []);

  return { status, saveNow };
}
