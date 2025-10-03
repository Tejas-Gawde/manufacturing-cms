"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createManufacturingOrder, CreateManufacturingOrderRequest } from "@/api/manufacturingOrders";
import { getBOMs } from "@/api/bom";
import { getWorkCenters } from "@/api/workCenter";
import { Plus, Trash } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "./ui/scroll-area";

interface AddManufacturingOrderDialogProps {
  onSuccess: () => void;
}

interface CustomWorkOrder {
  step_name: string;
  estimated_time: number;
}

export function AddManufacturingOrderDialog({ onSuccess }: AddManufacturingOrderDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [status, setStatus] = useState<'planned' | 'in_progress' | 'done' | 'canceled'>('planned');
  const [deadline, setDeadline] = useState("");
  const [bomId, setBomId] = useState<number | null>(null);
  const [workCenterId, setWorkCenterId] = useState<number | null>(null);
  const [customWorkOrders, setCustomWorkOrders] = useState<CustomWorkOrder[]>([
    { step_name: "", estimated_time: 0 },
  ]);
  
  const [availableBOMs, setAvailableBOMs] = useState<Array<{id: string, productName: string}>>([]);
  const [availableWorkCenters, setAvailableWorkCenters] = useState<Array<{id: string, name: string}>>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [bomsData, workCentersData] = await Promise.all([
          getBOMs(),
          getWorkCenters()
        ]);
        
        setAvailableBOMs(bomsData.map(bom => ({ id: bom.id, productName: bom.productName })));
        setAvailableWorkCenters(workCentersData.map(wc => ({ id: wc.id, name: wc.name })));
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Failed to load BOMs and work centers.");
      }
    }

    if (isDialogOpen) {
      fetchData();
    }
  }, [isDialogOpen]);

  const handleCustomWorkOrderChange = (
    index: number,
    field: keyof CustomWorkOrder,
    value: string | number
  ) => {
    const newWorkOrders = [...customWorkOrders];
    if (field === "estimated_time") {
      newWorkOrders[index][field] = parseFloat(value as string) || 0;
    } else {
      newWorkOrders[index][field] = value as string;
    }
    setCustomWorkOrders(newWorkOrders);
  };

  const handleAddCustomWorkOrder = () => {
    setCustomWorkOrders([...customWorkOrders, { step_name: "", estimated_time: 0 }]);
  };

  const handleRemoveCustomWorkOrder = (index: number) => {
    const newWorkOrders = customWorkOrders.filter((_, i) => i !== index);
    setCustomWorkOrders(newWorkOrders);
  };

  const handleCreateMO = async () => {
    try {
      if (!status || !deadline || !bomId || !workCenterId) {
        toast.error("Please fill in all required fields.");
        return;
      }

      const requestData: CreateManufacturingOrderRequest = {
        status,
        deadline,
        bom_id: bomId,
        work_center_id: workCenterId,
        customWorkOrders: customWorkOrders.filter(wo => wo.step_name && wo.estimated_time > 0)
      };

      await createManufacturingOrder(requestData);

      toast.success("Manufacturing order created successfully.");
      setIsDialogOpen(false);
      onSuccess();

      // Reset form
      setStatus('planned');
      setDeadline("");
      setBomId(null);
      setWorkCenterId(null);
      setCustomWorkOrders([{ step_name: "", estimated_time: 0 }]);
    } catch (err) {
      toast.error("Failed to create manufacturing order.");
      console.error(err);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          New <Plus className="ml-2 h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Manufacturing Order</DialogTitle>
          <DialogDescription>
            Create a new manufacturing order by selecting a BOM, work center, and deadline.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[calc(100vh-300px)] pr-4">
          <div className="flex flex-col gap-5">
            <div className="grid gap-4">
              <Label htmlFor="status">
                Status <span className="text-red-500">*</span>
              </Label>
              <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4">
              <Label htmlFor="deadline">
                Deadline <span className="text-red-500">*</span>
              </Label>
              <Input
                id="deadline"
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>

            <div className="grid gap-4">
              <Label htmlFor="bom">
                Bill of Materials <span className="text-red-500">*</span>
              </Label>
              <Select value={bomId?.toString() || ""} onValueChange={(value) => setBomId(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select BOM" />
                </SelectTrigger>
                <SelectContent>
                  {availableBOMs.map((bom) => (
                    <SelectItem key={bom.id} value={bom.id}>
                      {bom.productName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4">
              <Label htmlFor="workCenter">
                Work Center <span className="text-red-500">*</span>
              </Label>
              <Select value={workCenterId?.toString() || ""} onValueChange={(value) => setWorkCenterId(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select work center" />
                </SelectTrigger>
                <SelectContent>
                  {availableWorkCenters.map((wc) => (
                    <SelectItem key={wc.id} value={wc.id}>
                      {wc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label className="font-semibold text-base">
                Additional Work Orders (Optional)
              </Label>
              <Button variant="outline" size="sm" onClick={handleAddCustomWorkOrder}>
                <Plus className="mr-2 h-4 w-4" /> Add Work Order
              </Button>
            </div>

            <div className="space-y-3">
              {customWorkOrders.map((workOrder, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-3 items-center rounded-lg border p-3 bg-background"
                >
                  <div className="col-span-6">
                    <Label className="mb-1 block text-sm">Step Name</Label>
                    <Input
                      value={workOrder.step_name}
                      onChange={(e) =>
                        handleCustomWorkOrderChange(
                          index,
                          "step_name",
                          e.target.value
                        )
                      }
                      placeholder="Work order step name"
                    />
                  </div>
                  <div className="col-span-4">
                    <Label className="mb-1 block text-sm">Time (minutes)</Label>
                    <Input
                      type="number"
                      placeholder="Time"
                      value={workOrder.estimated_time}
                      onChange={(e) =>
                        handleCustomWorkOrderChange(index, "estimated_time", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleRemoveCustomWorkOrder(index)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button type="submit" onClick={handleCreateMO}>
            Create Manufacturing Order
          </Button>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
