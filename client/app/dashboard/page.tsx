import React from "react";

export default function DashboardPage() {
  return (
    <div className="flex w-full h-screen">
      <div className="flex-1 p-6">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Select a section from the sidebar to get started.
        </p>
      </div>
    </div>
  );
}
