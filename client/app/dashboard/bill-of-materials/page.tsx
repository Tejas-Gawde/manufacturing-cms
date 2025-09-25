"use client";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import { WorkCenter, getWorkCenters } from "@/api/workCenter";
import { useEffect, useState } from "react";
import { AddWorkCenterDialog } from "@/components/AddWorkCenterDialog";
import { parseID } from "@/lib/utils";

export default function WorkCenterPage() {
  const [workCenters, setWorkCenters] = useState<WorkCenter[]>([]);

  const fetchWorkCenters = async () => {
    const data = await getWorkCenters();
    setWorkCenters(data);
  };

  useEffect(() => {
    fetchWorkCenters();
  }, []);

  const columns: ColumnDef<WorkCenter>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => {
        const parsedId = parseID("WC", row.getValue("id"));
        return parsedId;
      },
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "capacity",
      header: "Capacity",
    },
    {
      accessorKey: "costPerHour",
      header: "Cost Per Hour",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("costPerHour"));
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "INR",
        }).format(amount);

        return <div className="font-medium">{formatted}</div>;
      },
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Bill of Materials</h1>
      <div className="flex justify-start mb-4">
        <AddWorkCenterDialog onSuccess={fetchWorkCenters} />
      </div>
      <DataTable columns={columns} data={workCenters} />
    </div>
  );
}
