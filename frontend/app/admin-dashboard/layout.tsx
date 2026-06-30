import React from "react";
import AdminLayout from "@/components/admin/AdminLayout";

export const metadata = {
  title: "Admin Dashboard | LevelUp Fitness",
  description: "Administrative oversight, platform metrics, user management and system configurations.",
};

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}
