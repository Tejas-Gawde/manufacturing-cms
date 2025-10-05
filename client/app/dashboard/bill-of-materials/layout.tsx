import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bill of Materials",
};

export default function BillOfMaterialsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
