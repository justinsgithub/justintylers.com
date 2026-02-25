"use client";

import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Check, Archive, Trash2, X } from "lucide-react";
import { toast } from "sonner";

interface BulkActionBarProps {
  selectedIds: Id<"socialDrafts">[];
  onClear: () => void;
}

export function BulkActionBar({ selectedIds, onClear }: BulkActionBarProps) {
  const bulkUpdate = useMutation(api.socialDrafts.bulkUpdateStatus);

  if (selectedIds.length === 0) return null;

  const handleApprove = async () => {
    await bulkUpdate({ ids: selectedIds, status: "approved" });
    toast.success(`Approved ${selectedIds.length} drafts`);
    onClear();
  };

  const handleArchive = async () => {
    await bulkUpdate({ ids: selectedIds, status: "archived" });
    toast.success(`Archived ${selectedIds.length} drafts`);
    onClear();
  };

  return (
    <div className="sticky top-0 z-10 flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
      <span className="text-sm font-medium text-foreground">
        {selectedIds.length} selected
      </span>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={handleApprove}>
          <Check className="mr-1.5 h-3.5 w-3.5" />
          Approve
        </Button>
        <Button size="sm" variant="outline" onClick={handleArchive}>
          <Archive className="mr-1.5 h-3.5 w-3.5" />
          Archive
        </Button>
      </div>
      <button
        onClick={onClear}
        className="ml-auto rounded-md p-1 text-muted-foreground hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
