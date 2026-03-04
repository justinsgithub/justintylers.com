"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SiteError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-bold tracking-tight">
        Something went wrong
      </h1>
      <p className="mt-3 text-muted-foreground">
        This page couldn&apos;t load right now. Try again in a moment.
      </p>
      <div className="mt-6 flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Link href="/">
          <Button variant="outline">Go home</Button>
        </Link>
      </div>
    </div>
  );
}
