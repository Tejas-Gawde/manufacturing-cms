"use client";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import { BOM, getBOMs } from "@/api/bom"; // Changed import
import { useEffect, useState } from "react";
import { AddBOMDialog } from "@/components/AddBOMDialog"; // Changed import
import { parseID } from "@/lib/utils";

export default function BillOfMaterialsPage() {
  // Changed function name
  const [boms, setBOMs] = useState<BOM[]>([]); // Changed state and setter

  const fetchBOMs = async () => {
    // Changed function name
    const data = await getBOMs(); // Changed API call
    setBOMs(data); // Changed setter
  };

  useEffect(() => {
    fetchBOMs();
  }, []);

  const columns: ColumnDef<BOM>[] = [
    // Changed ColumnDef type
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => {
        const parsedId = parseID("BOM", row.getValue("id")); // Changed prefix
        return parsedId;
      },
    },
    {
      accessorKey: "productName", // Changed accessorKey
      header: "Product Name", // Changed header
    },
    {
      accessorKey: "components",
      header: "Components",
      cell: ({ row }) => {
        const components: any[] = row.getValue("components");
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
        <AddBOMDialog onSuccess={fetchBOMs} />{" "}
        {/* Changed component and prop */}
      </div>
      <DataTable columns={columns} data={boms} /> {/* Changed data prop */}
    </div>
  );
}
