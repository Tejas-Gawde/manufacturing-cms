import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manufacturing Orders",
};

export default function ManufacturingOrdersLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
