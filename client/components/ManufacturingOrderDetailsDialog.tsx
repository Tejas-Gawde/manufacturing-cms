"use client";
import { ManufacturingOrderDetails } from "@/api/manufacturingOrders";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ManufacturingOrderDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  details: ManufacturingOrderDetails | null;
  getStatusBadgeVariant: (
    status: string
  ) => "default" | "secondary" | "destructive" | "outline";
}

export function ManufacturingOrderDetailsDialog({
  open,
  onOpenChange,
  details,
  getStatusBadgeVariant,
}: ManufacturingOrderDetailsDialogProps) {
  console.log(details);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Manufacturing Order Details</DialogTitle>
          <DialogDescription>
            Review the core order information, components, and work orders.
          </DialogDescription>
        </DialogHeader>

        {details && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <div className="p-4 border rounded-lg bg-muted/20 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">MO ID</span>
                  <span>MO-{details.id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Product</span>
                  <span>{details.productName || details.bomName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Work Center</span>
                  <span>{details.workCenterName}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">Status</span>
                  <Badge variant={getStatusBadgeVariant(details.status)}>
                    {details.status.replace("_", " ").toUpperCase()}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Deadline</span>
                  <span>{new Date(details.deadline).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Created By</span>
                  <span>{details.creatorName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Created At</span>
                  <span>{new Date(details.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {details.components && details.components.length > 0 && (
                <div className="p-4 border rounded-lg bg-background">
                  <h4 className="font-semibold mb-3">Components</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {details.components.map((c, idx) => (
                      <div key={idx} className="text-sm grid grid-cols-2 gap-2">
                        <div className="font-medium">{c.materialId}</div>
                        <div className="text-right">{c.quantity}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-1 p-4 border rounded-lg bg-background">
              <h4 className="font-semibold mb-3">Work Orders</h4>
              <div className="space-y-3 max-h-[480px] overflow-y-auto">
                {details.workOrders && details.workOrders.length > 0 ? (
                  details.workOrders.map((wo) => (
                    <div key={wo.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{wo.stepName}</div>
                          <div className="text-xs text-muted-foreground">
                            Est. {wo.estimatedTime} min
                          </div>
                        </div>
                        <Badge variant={getStatusBadgeVariant(wo.status)}>
                          {wo.status.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        {wo.assignedUserName && (
                          <div>Assigned To: {wo.assignedUserName}</div>
                        )}
                        {wo.startedAt && (
                          <div>
                            Started: {new Date(wo.startedAt).toLocaleString()}
                          </div>
                        )}
                        {wo.completedAt && (
                          <div>
                            Completed:{" "}
                            {new Date(wo.completedAt).toLocaleString()}
                          </div>
                        )}
                      </div>
                      {wo.comments && (
                        <div className="mt-2 p-2 bg-muted/30 rounded text-xs">
                          <span className="font-medium">Comments:</span>{" "}
                          {wo.comments}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    No work orders found.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
