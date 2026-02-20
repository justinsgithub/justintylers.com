"use client";

import { useEffect } from "react";
import { useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "../../convex/_generated/api";

export function UserInitializer() {
  const { isAuthenticated } = useConvexAuth();
  const getOrCreateUser = useMutation(api.users.getOrCreateUser);

  useEffect(() => {
    if (isAuthenticated) {
      getOrCreateUser();
    }
  }, [isAuthenticated, getOrCreateUser]);

  return null;
}
