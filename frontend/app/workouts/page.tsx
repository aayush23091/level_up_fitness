"use client";

import React from "react";
import DashboardLayout from "../components/DashboardLayout";
import WorkoutLibrary from "@/components/workouts/WorkoutLibrary";
import { withProtectedRoute } from "@/lib/protectedRoute";

function WorkoutsPageContent() {
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-white">Workouts</h1>
          <p className="text-gray-400 text-xs lg:text-sm mt-1">
            Explore our library of workouts and find the perfect one for you.
          </p>
        </div>
        <WorkoutLibrary />
      </div>
    </DashboardLayout>
  );
}

export default withProtectedRoute(WorkoutsPageContent, ["user"]);
