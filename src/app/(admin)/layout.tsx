"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Toaster } from "sonner";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const ADMIN_EMAIL = "justin@justintylers.com";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/sign-in?redirect_url=" + encodeURIComponent(window.location.pathname));
    }
  }, [isLoaded, isSignedIn, router]);

  const ready = isLoaded && isSignedIn;
  const email = user?.primaryEmailAddress?.emailAddress;
  const authorized = ready && email === ADMIN_EMAIL;

  // Always render children so page hooks run consistently.
  // The overlay hides content during auth loading.
  return (
    <>
      {!ready && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
          <div className="text-muted-foreground text-sm">
            {!isLoaded ? "Loading..." : "Redirecting..."}
          </div>
        </div>
      )}
      {ready && !authorized && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Not authorized</h1>
            <p className="mt-2 text-muted-foreground">This area is restricted.</p>
          </div>
        </div>
      )}
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="ml-56 flex-1 p-6">{children}</main>
      </div>
      <Toaster theme="dark" position="bottom-right" />
    </>
  );
}
