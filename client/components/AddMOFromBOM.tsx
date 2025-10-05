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
import { getBOMs, getBOMDetails, BOM } from "@/api/bom";
import { getWorkCenters } from "@/api/workCenter";
import { Package, Wrench } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddMOFromBOMProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function AddMOFromBOM({ onSuccess, onCancel }: AddMOFromBOMProps) {
  const [status, setStatus] = useState<
    "planned" | "in_progress" | "done" | "canceled"
  >("planned");
  const [deadline, setDeadline] = useState("");
  const [bomId, setBomId] = useState<number | null>(null);
  const [workCenterId, setWorkCenterId] = useState<number | null>(null);

  const [bomData, setBomData] = useState<BOM | null>(null);
  const [productName, setProductName] = useState("");

  const [availableBOMs, setAvailableBOMs] = useState<
    Array<{ id: string; productName: string }>
  >([]);
  const [availableWorkCenters, setAvailableWorkCenters] = useState<
    Array<{ id: string; name: string }>
  >([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [bomsData, workCentersData] = await Promise.all([
          getBOMs(),
          getWorkCenters(),
        ]);

        setAvailableBOMs(
          bomsData.map((bom) => ({
            id: String(bom.id),
            productName: bom.productName,
          }))
        );
        setAvailableWorkCenters(
          workCentersData.map((wc) => ({ id: String(wc.id), name: wc.name }))
        );
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Failed to load data.");
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    async function fetchBOMDetails() {
      if (bomId) {
        try {
          const bomDetails = await getBOMDetails(bomId.toString());
          setBomData(bomDetails);
          setProductName(bomDetails?.productName || "");
        } catch (error) {
          console.error("Failed to fetch BOM details:", error);
          toast.error("Failed to load BOM details.");
        }
      } else {
        setBomData(null);
        setProductName("");
      }
    }

    fetchBOMDetails();
  }, [bomId]);

  const handleCreateMO = async () => {
    try {
      if (!status || !deadline || !workCenterId || !bomId) {
        toast.error("Please fill in all required fields.");
        return;
      }

      const requestData: CreateManufacturingOrderRequest = {
        status,
        deadline,
        bom_id: bomId,
        work_center_id: workCenterId,
        product_name: productName || undefined,
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
      <div className="space-y-4">
        <div className="flex flex-col gap-4 w-full">
          <Label htmlFor="productName">Product Name</Label>
          <Input id="productName" value={productName} readOnly />
        </div>

        <div className="flex flex-col gap-4 w-full">
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

        <div className="flex flex-col gap-4">
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

        <div className="flex flex-col gap-4">
          <Label htmlFor="workCenter">
            Work Center <span className="text-red-500">*</span>
          </Label>
          <Select
            value={workCenterId?.toString() || ""}
            onValueChange={(value) => {
              console.log("Work center selected:", value);
              setWorkCenterId(parseInt(value));
            }}
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

        <div className="flex flex-col gap-4">
          <Label htmlFor="bom">
            Bill of Materials <span className="text-red-500">*</span>
          </Label>
          <Select
            value={bomId?.toString() || ""}
            onValueChange={(value) => {
              console.log("BOM selected:", value);
              setBomId(parseInt(value));
            }}
          >
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
      </div>

      {bomData && (
        <div className="space-y-4">
          <div className="rounded-lg border p-4 bg-muted/50">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Package className="h-4 w-4" />
              BOM Components (Auto-filled)
            </h4>
            <div className="space-y-2">
              {bomData.components.map((component, index) => (
                <div key={index} className="grid grid-cols-2 gap-2 text-sm">
                  <div className="font-medium">
                    Material ID: {component.materialId}
                  </div>
                  <div>Qty: {component.quantity}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border p-4 bg-muted/50">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              BOM Work Orders (Auto-filled)
            </h4>
            <div className="space-y-2">
              {bomData.workOrder.map((workOrder, index) => (
                <div key={index} className="grid grid-cols-2 gap-2 text-sm">
                  <div className="font-medium">{workOrder.workOrderName}</div>
                  <div>Time: {workOrder.time} min</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleCreateMO}>Create Manufacturing Order</Button>
      </div>
    </div>
  );
}
