"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  createManufacturingOrder,
  CreateManufacturingOrderRequest,
} from "@/api/manufacturingOrders";
import { getWorkCenters } from "@/api/workCenter";
import { BalanceItem, listStockBalances } from "@/api/stock";
import { Plus, Trash, Package, Wrench } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddMOManualProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface CustomWorkOrder {
  step_name: string;
  estimated_time: number;
}

interface Component {
  material_name: string;
  qty: number;
  unit: string;
  unit_cost: number;
}

export function AddMOManual({ onSuccess, onCancel }: AddMOManualProps) {
  const [status, setStatus] = useState<
    "planned" | "in_progress" | "done" | "canceled"
  >("planned");
  const [deadline, setDeadline] = useState("");
  const [workCenterId, setWorkCenterId] = useState<number | null>(null);
  const [productName, setProductName] = useState("");

  const [components, setComponents] = useState<Component[]>([]);
  const [workOrders, setWorkOrders] = useState<CustomWorkOrder[]>([
    { step_name: "", estimated_time: 0 },
  ]);

  const [availableWorkCenters, setAvailableWorkCenters] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [availableStockItems, setAvailableStockItems] = useState<BalanceItem[]>(
    []
  );

  useEffect(() => {
    async function fetchData() {
      try {
        const [workCentersData, stockLedger] = await Promise.all([
          getWorkCenters(),
          listStockBalances(),
        ]);

        setAvailableWorkCenters(
          workCentersData.map((wc) => ({ id: String(wc.id), name: wc.name }))
        );
        setAvailableStockItems(stockLedger);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Failed to load data.");
      }
    }

    fetchData();
  }, []);

  const handleWorkOrderChange = (
    index: number,
    field: keyof CustomWorkOrder,
    value: string | number
  ) => {
    const newWorkOrders = [...workOrders];
    if (field === "estimated_time") {
      newWorkOrders[index][field] = parseFloat(value as string) || 0;
    } else {
      newWorkOrders[index][field] = value as string;
    }
    setWorkOrders(newWorkOrders);
  };

  const handleAddWorkOrder = () => {
    setWorkOrders([...workOrders, { step_name: "", estimated_time: 0 }]);
  };

  const handleRemoveWorkOrder = (index: number) => {
    const newWorkOrders = workOrders.filter((_, i) => i !== index);
    setWorkOrders(newWorkOrders);
  };

  const handleComponentChange = (
    index: number,
    field: keyof Component,
    value: string | number
  ) => {
    const newComponents = [...components];
    if (field === "qty" || field === "unit_cost") {
      newComponents[index][field] = parseFloat(value as string) || 0;
    } else {
      newComponents[index][field] = value as string;
    }
    setComponents(newComponents);
  };

  const handleAddComponent = () => {
    setComponents([
      ...components,
      { material_name: "", qty: 0, unit: "piece", unit_cost: 0 },
    ]);
  };

  const handleRemoveComponent = (index: number) => {
    const newComponents = components.filter((_, i) => i !== index);
    setComponents(newComponents);
  };

  const handleStockItemSelect = (stockItem: BalanceItem) => {
    const newComponent: Component = {
      material_name: stockItem.materialName,
      qty: 1,
      unit: stockItem.unit,
      unit_cost: stockItem.unitCost,
    };
    setComponents([...components, newComponent]);
  };

  const handleCreateMO = async () => {
    try {
      if (!status || !deadline || !workCenterId) {
        toast.error("Please fill in all required fields.");
        return;
      }

      if (!productName.trim()) {
        toast.error("Please enter a Product Name.");
        return;
      }

      if (components.length === 0 || workOrders.length === 0) {
        toast.error(
          "Please add at least one component and one work order for manual creation."
        );
        return;
      }

      const requestData: CreateManufacturingOrderRequest = {
        status,
        deadline,
        work_center_id: workCenterId,
        components: components.filter((c) => c.material_name && c.qty > 0),
        work_orders: workOrders.filter(
          (wo) => wo.step_name && wo.estimated_time > 0
        ),
        product_name: productName.trim(),
      };

      await createManufacturingOrder(requestData);

      toast.success("Manufacturing order created successfully.");
      onSuccess();
    } catch (err) {
      toast.error("Failed to create manufacturing order.");
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-2">
        <Label htmlFor="productName">
          Product Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="productName"
          placeholder="Final product name"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="status">
          Status <span className="text-red-500">*</span>
        </Label>
        <Select
          value={status}
          onValueChange={(
            value: "planned" | "in_progress" | "done" | "canceled"
          ) => setStatus(value)}
        >
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

      <div className="grid gap-2">
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

      <div className="grid gap-2">
        <Label htmlFor="workCenter">
          Work Center <span className="text-red-500">*</span>
        </Label>
        <Select
          value={workCenterId?.toString() || ""}
          onValueChange={(value) => setWorkCenterId(parseInt(value))}
        >
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

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="font-semibold text-base flex items-center gap-2">
            <Package className="h-4 w-4" />
            Components
          </Label>
          <Button variant="outline" size="sm" onClick={handleAddComponent}>
            <Plus className="mr-2 h-4 w-4" /> Add Component
          </Button>
        </div>

        <div className="rounded-lg border p-4">
          <h5 className="font-medium mb-2">Available Stock Items</h5>
          <div className="grid grid-cols-2 gap-2  overflow-y-auto">
            {availableStockItems.map((item, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleStockItemSelect(item)}
                className="justify-start text-left"
              >
                <div className="text-xs">
                  <div className="font-medium">{item.materialName}</div>
                  <div className="text-muted-foreground">
                    {item.balance} {item.unit} @ ${item.unitCost}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {components.map((component, index) => (
            <div
              key={index}
              className="grid grid-cols-12 gap-3 items-center rounded-lg border p-3 bg-background"
            >
              <div className="col-span-4">
                <Label className="mb-1 block text-sm">Material Name</Label>
                <Input
                  value={component.material_name}
                  onChange={(e) =>
                    handleComponentChange(
                      index,
                      "material_name",
                      e.target.value
                    )
                  }
                  placeholder="Material name"
                />
              </div>
              <div className="col-span-2">
                <Label className="mb-1 block text-sm">Quantity</Label>
                <Input
                  type="number"
                  value={component.qty}
                  onChange={(e) =>
                    handleComponentChange(index, "qty", e.target.value)
                  }
                />
              </div>
              <div className="col-span-2">
                <Label className="mb-1 block text-sm">Unit</Label>
                <Input
                  value={component.unit}
                  onChange={(e) =>
                    handleComponentChange(index, "unit", e.target.value)
                  }
                />
              </div>
              <div className="col-span-2">
                <Label className="mb-1 block text-sm">Unit Cost</Label>
                <Input
                  type="number"
                  value={component.unit_cost}
                  onChange={(e) =>
                    handleComponentChange(index, "unit_cost", e.target.value)
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
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="font-semibold text-base flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Work Orders
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
                <Label className="mb-1 block text-sm">Step Name</Label>
                <Input
                  value={workOrder.step_name}
                  onChange={(e) =>
                    handleWorkOrderChange(index, "step_name", e.target.value)
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
                    handleWorkOrderChange(
                      index,
                      "estimated_time",
                      e.target.value
                    )
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

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleCreateMO}>Create Manufacturing Order</Button>
      </div>
    </div>
  );
}
