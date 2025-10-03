"use client";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import { ManufacturingOrder, getManufacturingOrders, updateManufacturingOrder, deleteManufacturingOrder, getManufacturingOrderDetails, ManufacturingOrderDetails } from "@/api/manufacturingOrders";
import { useEffect, useState } from "react";
import { AddManufacturingOrderDialog } from "@/components/AddManufacturingOrderDialog";
import { parseID } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ManufacturingOrdersPage() {
  const [manufacturingOrders, setManufacturingOrders] = useState<ManufacturingOrder[]>([]);
  const [selectedMO, setSelectedMO] = useState<ManufacturingOrderDetails | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const fetchManufacturingOrders = async () => {
    try {
      const data = await getManufacturingOrders();
      setManufacturingOrders(data);
    } catch (error) {
      console.error("Failed to fetch manufacturing orders:", error);
      toast.error("Failed to load manufacturing orders");
    }
  };

  useEffect(() => {
    fetchManufacturingOrders();
  }, []);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'planned':
        return 'secondary';
      case 'in_progress':
        return 'default';
      case 'done':
        return 'outline';
      case 'canceled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: 'planned' | 'in_progress' | 'done' | 'canceled') => {
    try {
      await updateManufacturingOrder(id, { status: newStatus });
      toast.success("Status updated successfully");
      fetchManufacturingOrders();
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this manufacturing order?")) {
      try {
        await deleteManufacturingOrder(id);
        toast.success("Manufacturing order deleted successfully");
        fetchManufacturingOrders();
      } catch (error) {
        console.error("Failed to delete manufacturing order:", error);
        toast.error("Failed to delete manufacturing order");
      }
    }
  };

  const handleViewDetails = async (mo: ManufacturingOrder) => {
    try {
      const details = await getManufacturingOrderDetails(mo.id);
      setSelectedMO(details);
      setIsDetailsDialogOpen(true);
    } catch (error) {
      console.error("Failed to fetch MO details:", error);
      toast.error("Failed to load manufacturing order details");
    }
  };

  const columns: ColumnDef<ManufacturingOrder>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => {
        const parsedId = parseID("MO", row.getValue("id"));
        return parsedId;
      },
    },
    {
      accessorKey: "bomName",
      header: "Product",
    },
    {
      accessorKey: "workCenterName",
      header: "Work Center",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge variant={getStatusBadgeVariant(status)}>
            {status.replace('_', ' ').toUpperCase()}
          </Badge>
        );
      },
    },
    {
      accessorKey: "deadline",
      header: "Deadline",
      cell: ({ row }) => {
        const date = new Date(row.getValue("deadline"));
        return date.toLocaleDateString() + " " + date.toLocaleTimeString();
      },
    },
    {
      accessorKey: "creatorName",
      header: "Created By",
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"));
        return date.toLocaleDateString();
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const mo = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleViewDetails(mo)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {mo.status !== 'done' && mo.status !== 'canceled' && (
                <>
                  <DropdownMenuItem onClick={() => handleStatusUpdate(mo.id, 'in_progress')}>
                    <Edit className="mr-2 h-4 w-4" />
                    Start Production
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusUpdate(mo.id, 'done')}>
                    <Edit className="mr-2 h-4 w-4" />
                    Mark Complete
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusUpdate(mo.id, 'canceled')}>
                    <Edit className="mr-2 h-4 w-4" />
                    Cancel Order
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => handleDelete(mo.id)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Calculate statistics
  const stats = {
    total: manufacturingOrders.length,
    planned: manufacturingOrders.filter(mo => mo.status === 'planned').length,
    inProgress: manufacturingOrders.filter(mo => mo.status === 'in_progress').length,
    done: manufacturingOrders.filter(mo => mo.status === 'done').length,
    canceled: manufacturingOrders.filter(mo => mo.status === 'canceled').length,
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manufacturing Orders</h1>
        <AddManufacturingOrderDialog onSuccess={fetchManufacturingOrders} />
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-sm text-muted-foreground">Total Orders</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.planned}</div>
          <div className="text-sm text-muted-foreground">Planned</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold text-orange-600">{stats.inProgress}</div>
          <div className="text-sm text-muted-foreground">In Progress</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">{stats.done}</div>
          <div className="text-sm text-muted-foreground">Completed</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold text-red-600">{stats.canceled}</div>
          <div className="text-sm text-muted-foreground">Canceled</div>
        </div>
      </div>
      
      <DataTable filterValue="bomName" columns={columns} data={manufacturingOrders} />

      {/* Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Manufacturing Order Details</DialogTitle>
            <DialogDescription>
              Detailed information about the manufacturing order and its work orders.
            </DialogDescription>
          </DialogHeader>
          {selectedMO && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Order Information</h3>
                  <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                    <div className="flex justify-between">
                      <span className="font-medium">ID:</span>
                      <span>{parseID("MO", selectedMO.id)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Product:</span>
                      <span>{selectedMO.bomName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Work Center:</span>
                      <span>{selectedMO.workCenterName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Status:</span>
                      <Badge variant={getStatusBadgeVariant(selectedMO.status)}>
                        {selectedMO.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Deadline:</span>
                      <span>{new Date(selectedMO.deadline).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Created By:</span>
                      <span>{selectedMO.creatorName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Created At:</span>
                      <span>{new Date(selectedMO.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Work Orders</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {selectedMO.workOrders && selectedMO.workOrders.length > 0 ? (
                      selectedMO.workOrders.map((workOrder) => (
                        <div key={workOrder.id} className="p-4 bg-background border rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">{workOrder.stepName}</h4>
                            <Badge variant={getStatusBadgeVariant(workOrder.status)}>
                              {workOrder.status.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex justify-between">
                              <span>Estimated Time:</span>
                              <span>{workOrder.estimatedTime} minutes</span>
                            </div>
                            {workOrder.assignedUserName && (
                              <div className="flex justify-between">
                                <span>Assigned To:</span>
                                <span>{workOrder.assignedUserName}</span>
                              </div>
                            )}
                            {workOrder.startedAt && (
                              <div className="flex justify-between">
                                <span>Started At:</span>
                                <span>{new Date(workOrder.startedAt).toLocaleString()}</span>
                              </div>
                            )}
                            {workOrder.completedAt && (
                              <div className="flex justify-between">
                                <span>Completed At:</span>
                                <span>{new Date(workOrder.completedAt).toLocaleString()}</span>
                              </div>
                            )}
                            {workOrder.comments && (
                              <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                                <span className="font-medium">Comments:</span> {workOrder.comments}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-muted-foreground">
                        No work orders found for this manufacturing order.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
