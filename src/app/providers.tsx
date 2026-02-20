"use client";

import { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { PostHogProvider } from "@/components/posthog-provider";
import { UserInitializer } from "@/components/user-initializer";

const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL as string
);

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY as string}
      appearance={{ baseTheme: dark }}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <PostHogProvider>
          <UserInitializer />
          {children}
        </PostHogProvider>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
