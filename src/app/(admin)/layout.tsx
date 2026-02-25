"use client";

import { SignedIn, SignedOut, RedirectToSignIn, useUser } from "@clerk/nextjs";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Toaster } from "sonner";

const ADMIN_EMAIL = "justin@justintylers.com";

function AdminGate({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading...</div>
      </div>
    );
  }

  const email = user?.primaryEmailAddress?.emailAddress;
  if (email !== ADMIN_EMAIL) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Not authorized</h1>
          <p className="mt-2 text-muted-foreground">
            This area is restricted.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        <AdminGate>
          <div className="flex min-h-screen">
            <AdminSidebar />
            <main className="ml-56 flex-1 p-6">{children}</main>
          </div>
        </AdminGate>
      </SignedIn>
      <Toaster theme="dark" position="bottom-right" />
    </>
  );
}
