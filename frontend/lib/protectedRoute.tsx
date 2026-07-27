"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { getDashboardPath } from "@/lib/auth";

export function withProtectedRoute<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  allowedRoles?: string[]
) {
  return function ProtectedRoute(props: P) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading) {
        if (!user) {
          router.replace("/login");
          return;
        }

        if (allowedRoles && !allowedRoles.includes(user.role)) {
          router.replace(getDashboardPath(user.role));
          return;
        }
      }
    }, [user, loading, router, allowedRoles]);

    if (loading) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-foreground">Loading...</div>
        </div>
      );
    }

    if (!user) {
      return null;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}
