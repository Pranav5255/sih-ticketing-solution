import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useState, useEffect } from "react";

/**
 * Temporary auth hook that returns mock data
 * Replace this with your actual auth implementation
 */
export function useAuth() {
  const user = useQuery(api.users.currentUser);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user !== undefined) {
      setIsLoading(false);
    }
  }, [user]);

  return {
    isLoading,
    isAuthenticated: !!user,
    user,
    // Accept any args for compatibility with existing calls while auth is disabled
    signIn: async (..._args: any[]) => {
      console.log("Sign in - implement your auth here", _args);
    },
    signOut: async (..._args: any[]) => {
      console.log("Sign out - implement your auth here", _args);
    },
  };
}