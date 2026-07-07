import React from "react";
import CoachLayout from "@/components/coach/CoachLayout";

export const metadata = {
  title: "Coach Dashboard | LevelUp Fitness",
  description: "Coach dashboard for managing clients and training programs.",
};

export default function CoachDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CoachLayout>{children}</CoachLayout>;
}
