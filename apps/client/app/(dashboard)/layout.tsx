import type React from "react";
import { AppLayout } from "@/components/app-layout";
import { ProtectedRoute } from "@/lib/route-guard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requireAuth={true} redirectTo="/login">
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  );
}
