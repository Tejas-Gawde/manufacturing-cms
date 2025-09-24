import React from "react";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Home", href: "/dashboard" },
  { label: "Manufacturing Orders", href: "/dashboard/manufacturing-orders" },
  { label: "Work Orders", href: "/dashboard/work-orders" },
  { label: "Work Centers", href: "/dashboard/work-centers" },
  { label: "Bill of Materials", href: "/dashboard/bill-of-materials" },
  { label: "Stock Ledger", href: "/dashboard/stock-ledger" },
];

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-row">
      <aside className="w-56 shrink-0 border-r bg-background/50 p-3">
        <div className="mb-3 px-2 text-sm font-semibold text-muted-foreground">
          Navigation
        </div>
        <nav className="grid gap-1">
          {navItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              className="justify-start"
              asChild
            >
              <a href={item.href}>{item.label}</a>
            </Button>
          ))}
        </nav>
      </aside>
      {children}
    </div>
  );
}
