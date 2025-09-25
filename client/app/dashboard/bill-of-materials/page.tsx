"use client";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import { BOM, getBOMs } from "@/api/bom";
import { useEffect, useState } from "react";
import { AddBOMDialog } from "@/components/AddBOMDialog";
import { parseID } from "@/lib/utils";

export default function BillOfMaterialsPage() {
  const [boms, setBOMs] = useState<BOM[]>([]);

  const fetchBOMs = async () => {
    const data = await getBOMs();
    setBOMs(data);
  };

  useEffect(() => {
    fetchBOMs();
  }, []);

  const columns: ColumnDef<BOM>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => {
        const parsedId = parseID("BOM", row.getValue("id"));
        return parsedId;
      },
    },
    {
      accessorKey: "productName",
      header: "Product Name",
    },
    {
      accessorKey: "components",
      header: "Components",
      cell: ({ row }) => {
        const components = row.getValue("components") as {
          materialId: string;
          quantity: number;
        }[];
        return (
          <ul className="list-disc list-inside">
            {components.map((comp, index) => (
              <li key={index}>
                {comp.materialId} (x{comp.quantity})
              </li>
            ))}
          </ul>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"));
        return date.toLocaleDateString();
      },
    },
  ];

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-4">Bill of Materials</h1>
      <div className="flex justify-start mb-4">
        <AddBOMDialog onSuccess={fetchBOMs} />
      </div>
      <DataTable columns={columns} data={boms} />
    </div>
  );
}
