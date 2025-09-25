import React from "react";
import { Button } from "@/components/ui/button";
import { Home, Box, Layers, Settings, FileText, Clipboard } from "lucide-react"; // Importing Lucide icons

const navItems = [
  { label: "Home", href: "/dashboard", icon: <Home /> },
  {
    label: "Manufacturing Orders",
    href: "/dashboard/manufacturing-orders",
    icon: <Box />,
  },
  { label: "Work Orders", href: "/dashboard/work-orders", icon: <Layers /> },
  {
    label: "Work Centers",
    href: "/dashboard/work-centers",
    icon: <Settings />,
  },
  {
    label: "Bill of Materials",
    href: "/dashboard/bill-of-materials",
    icon: <FileText />,
  },
  {
    label: "Stock Ledger",
    href: "/dashboard/stock-ledger",
    icon: <Clipboard />,
  },
];

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-row h-screen">
      <aside className="shrink-0 border-r bg-background/50 p-4">
        <div className="mb-4 px-2 text-lg font-semibold text-muted-foreground">
          Navigation
        </div>

        <nav className="grid gap-2 pr-3">
          {navItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              className="justify-start"
              asChild
            >
              <a href={item.href} className="flex items-center gap-3">
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </a>
            </Button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
