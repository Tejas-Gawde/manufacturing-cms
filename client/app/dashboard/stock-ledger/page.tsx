"use client";
import React, { useCallback, useEffect, useState } from "react";
import { DataTable } from "@/components/DataTable";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  listStockBalances,
  listStockLedger,
  LedgerItem,
  BalanceItem,
} from "@/api/stock";
import { AddStockDialog } from "@/components/AddStockDialog";
import { Checkbox } from "@/components/ui/checkbox";
import { parseID } from "@/lib/utils";

// Define types for the data
const ledgerColumns: ColumnDef<LedgerItem>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => {
      const parsedId = parseID("ST", row.getValue("id"));
      return parsedId;
    },
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("date"));
      return date.toUTCString();
    },
  },
  { accessorKey: "materialName", header: "Name" },
  { accessorKey: "materialType", header: "Type" },
  { accessorKey: "quantity", header: "Quantity" },
  { accessorKey: "unit", header: "Unit" },
  { accessorKey: "unitCost", header: "Unit Cost" },
  {
    accessorKey: "totalValue",
    header: "Total Value",
    cell: ({ row }) => {
      const totalValue = parseFloat(row.getValue("totalValue"));
      return Math.abs(totalValue);
    },
  },
  { accessorKey: "workOrderId", header: "Work Order" },
];

const balanceColumns: ColumnDef<BalanceItem>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  { accessorKey: "materialName", header: "Name" },
  { accessorKey: "materialType", header: "Type" },
  { accessorKey: "unit", header: "Unit" },
  { accessorKey: "totalValue", header: "Total Value" },
  { accessorKey: "balance", header: "Balance" },
];

export default function StockLedgerPage() {
  const [view, setView] = useState<"ledger" | "balance">("ledger");
  const [ledgerData, setLedgerData] = useState<LedgerItem[]>([]);
  const [balanceData, setBalanceData] = useState<BalanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (view === "ledger") {
        const data = await listStockLedger();
        setLedgerData(data);
      } else {
        const data = await listStockBalances();
        setBalanceData(data);
      }
    } catch (err) {
      setError("Failed to fetch data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [view]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold mb-4">Stock</h1>
      <div className="flex gap-2 mb-2">
        <Button
          className={` ${view === "ledger" ? "bg-blue-600" : ""}`}
          onClick={() => setView("ledger")}
        >
          Ledger
        </Button>
        <Button
          className={` ${view === "balance" ? "bg-blue-600" : ""}`}
          onClick={() => setView("balance")}
        >
          Balance
        </Button>
        <AddStockDialog onSuccess={fetchData} />
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : view === "ledger" ? (
        <DataTable columns={ledgerColumns} data={ledgerData} />
      ) : (
        <DataTable columns={balanceColumns} data={balanceData} />
      )}
    </div>
  );
}
