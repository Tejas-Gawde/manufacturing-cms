import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Work Centers",
};

export default function WorkCentersLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
