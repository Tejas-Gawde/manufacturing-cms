"use client";
import { useEffect, useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { listWorkOrders, WorkOrderListItem } from "@/api/workOrders";
import { toast } from "sonner";

export default function WorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrderListItem[]>([]);

  const fetchWorkOrders = async () => {
    try {
      const items = await listWorkOrders();
      setWorkOrders(items);
    } catch (error) {
      console.error("Failed to fetch work orders:", error);
      toast.error("Failed to load work orders");
    }
  };

  useEffect(() => {
    fetchWorkOrders();
  }, []);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary" as const;
      case "started":
        return "default" as const;
      case "paused":
        return "outline" as const;
      case "completed":
        return "default" as const;
      default:
        return "secondary" as const;
    }
  };

  const columns: ColumnDef<WorkOrderListItem>[] = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "ID",
      },
      {
        accessorKey: "moId",
        header: "MO ID",
        cell: ({ row }) => `MO-${row.original.moId}`,
      },
      {
        accessorKey: "stepName",
        header: "Step",
      },
      {
        accessorKey: "estimatedTime",
        header: "Est. Time (min)",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={getStatusBadgeVariant(row.original.status)}>
            {row.original.status.toUpperCase()}
          </Badge>
        ),
      },
      {
        accessorKey: "assignedUserName",
        header: "Assigned To",
      },
      {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
      },
    ],
    []
  );

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Work Orders</h1>
      </div>

      <DataTable filterValue="stepName" columns={columns} data={workOrders} />
    </div>
  );
}
