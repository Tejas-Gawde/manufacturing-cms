"use client";
import React, { useEffect, useState } from "react";
import { DataTable } from "@/components/DataTable";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  listStockBalances,
  listStockLedger,
  LedgerItem,
  BalanceItem,
} from "@/api/stock";
import { AddStockDialog } from "@/components/AddStockDialogue";

// Define types for the data
const ledgerColumns: ColumnDef<LedgerItem>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "date", header: "Date" },
  { accessorKey: "materialName", header: "Material" },
  { accessorKey: "materialType", header: "Type" },
  { accessorKey: "quantity", header: "Quantity" },
  { accessorKey: "unit", header: "Unit" },
  { accessorKey: "unitCost", header: "Unit Cost" },
  {
    accessorKey: "totalValue",
    header: "Total Value",
    cell: ({ row }) => {
      const totalValue = parseFloat(row.getValue("totalValue"));
      console.log(Math.abs(totalValue), "heheh");
      return Math.abs(totalValue);
    },
  },
  { accessorKey: "workOrderId", header: "Work Order" },
];

const balanceColumns: ColumnDef<BalanceItem>[] = [
  { accessorKey: "materialName", header: "Material" },
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
  // Removed isDialogOpen and newMovement state

  const fetchData = async () => {
    // Extracted fetchData into a named function
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
  };

  useEffect(() => {
    fetchData();
  }, [view]);

  // Removed handleInputChange, handleSelectChange, handleAddMovement functions

  return (
    <div className="space-y-4">
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
