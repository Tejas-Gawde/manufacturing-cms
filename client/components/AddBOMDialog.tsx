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
import { createBOM, BOMComponent, WorkOrderForBOM } from "@/api/bom";
import { Plus, Trash } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { listStockBalances } from "@/api/stock";
import { ScrollArea } from "./ui/scroll-area";

interface AddBOMDialogProps {
  onSuccess: () => void;
}

export function AddBOMDialog({ onSuccess }: AddBOMDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState<number>(0);
  const [components, setComponents] = useState<BOMComponent[]>([
    { materialId: "", quantity: 0 },
  ]);
  const [availableMaterials, setAvailableMaterials] = useState<string[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrderForBOM[]>([
    { workOrderName: "", time: 0 },
  ]);

  useEffect(() => {
    async function fetchMaterials() {
      try {
        const stockBalances = await listStockBalances();
        const materials = stockBalances.map((item) => item.materialName);
        setAvailableMaterials(materials);
      } catch (error) {
        console.error("Failed to fetch available materials:", error);
        toast.error("Failed to load available materials.");
      }
    }

    if (isDialogOpen) {
      fetchMaterials();
    }
  }, [isDialogOpen]);

  const handleProductNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProductName(e.target.value);
  };

  const handlequantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuantity(parseFloat(e.target.value) || 0);
  };

  const handleComponentChange = (
    index: number,
    field: keyof BOMComponent,
    value: string | number
  ) => {
    const newComponents = [...components];
    if (field === "quantity") {
      newComponents[index][field] = parseFloat(value as string) || 0;
    } else {
      newComponents[index][field] = value as string;
    }
    setComponents(newComponents);
  };

  const handleAddComponent = () => {
    setComponents([...components, { materialId: "", quantity: 0 }]);
  };

  const handleRemoveComponent = (index: number) => {
    const newComponents = components.filter((_, i) => i !== index);
    setComponents(newComponents);
  };

  const handleWorkOrderChange = (
    index: number,
    field: keyof WorkOrderForBOM,
    value: string | number
  ) => {
    const newWorkOrders = [...workOrders];
    if (field === "time") {
      newWorkOrders[index][field] = parseFloat(value as string) || 0;
    } else {
      newWorkOrders[index][field] = value as string;
    }
    setWorkOrders(newWorkOrders);
  };

  const handleAddWorkOrder = () => {
    setWorkOrders([...workOrders, { workOrderName: "", time: 0 }]);
  };

  const handleRemoveWorkOrder = (index: number) => {
    const newWorkOrders = workOrders.filter((_, i) => i !== index);
    setWorkOrders(newWorkOrders);
  };

  const handleAddBOM = async () => {
    try {
      if (
        !productName ||
        quantity <= 0 ||
        components.some((comp) => !comp.materialId || comp.quantity <= 0) ||
        workOrders.some((wo) => !wo.workOrderName || wo.time <= 0)
      ) {
        toast.error(
          "Please fill in all required fields and ensure quantities and work order times are positive."
        );
        return;
      }

      await createBOM({
        productName,
        quantity,
        components,
        workOrder: workOrders,
      });

      toast.success("BOM added successfully.");
      setIsDialogOpen(false);
      onSuccess();

      setProductName("");
      setQuantity(0);
      setComponents([{ materialId: "", quantity: 0 }]);
      setWorkOrders([{ workOrderName: "", time: 0 }]);
    } catch (err) {
      toast.error("Failed to add BOM.");
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Bill of Materials</DialogTitle>
          <DialogDescription>
            Define a new Bill of Materials by adding a product name and its
            components.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[calc(100vh-300px)] pr-4">
          <div className="flex flex-col gap-5">
            <div className="grid gap-4">
              <Label htmlFor="productName">
                Product Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="productName"
                value={productName}
                onChange={handleProductNameChange}
                placeholder="Enter product name"
              />
            </div>

            {/* ✅ New Quantity Input */}
            <div className="grid gap-4">
              <Label htmlFor="quantity">
                Product Quantity <span className="text-red-500">*</span>
              </Label>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={handlequantityChange}
                placeholder="Enter quantity"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="font-semibold text-base">
                Components <span className="text-red-500">*</span>
              </Label>
              <Button variant="outline" size="sm" onClick={handleAddComponent}>
                <Plus className="mr-2 h-4 w-4" /> Add Component
              </Button>
            </div>

            {/* Components UI same as before */}
            <div className="space-y-3">
              {components.map((component, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-3 items-center rounded-lg border p-3 bg-background"
                >
                  <div className="col-span-5">
                    <Label className="mb-1 block text-sm">Material</Label>
                    <Select
                      value={component.materialId}
                      onValueChange={(value) =>
                        handleComponentChange(index, "materialId", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select material" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableMaterials.map((material, matIndex) => (
                          <SelectItem key={matIndex} value={material}>
                            {material}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-5">
                    <Label className="mb-1 block text-sm">Quantity</Label>
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={component.quantity}
                      onChange={(e) =>
                        handleComponentChange(index, "quantity", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleRemoveComponent(index)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <Label className="font-semibold text-base">
                Work Orders <span className="text-red-500">*</span>
              </Label>
              <Button variant="outline" size="sm" onClick={handleAddWorkOrder}>
                <Plus className="mr-2 h-4 w-4" /> Add Work Order
              </Button>
            </div>

            <div className="space-y-3">
              {workOrders.map((workOrder, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-3 items-center rounded-lg border p-3 bg-background"
                >
                  <div className="col-span-6">
                    <Label className="mb-1 block text-sm">Name</Label>
                    <Input
                      value={workOrder.workOrderName}
                      onChange={(e) =>
                        handleWorkOrderChange(
                          index,
                          "workOrderName",
                          e.target.value
                        )
                      }
                      placeholder="Work order name"
                    />
                  </div>
                  <div className="col-span-4">
                    <Label className="mb-1 block text-sm">Time (mins)</Label>
                    <Input
                      type="number"
                      placeholder="Time"
                      value={workOrder.time}
                      onChange={(e) =>
                        handleWorkOrderChange(index, "time", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleRemoveWorkOrder(index)}
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
          <Button type="submit" onClick={handleAddBOM}>
            Create BOM
          </Button>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
