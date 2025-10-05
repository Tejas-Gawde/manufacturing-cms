import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Work Orders",
};

export default function WorkOrdersLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
