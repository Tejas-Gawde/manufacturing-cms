"use client";
import React, { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { addStockMovement, AddMovementPayload } from "@/api/stock";
import { Plus } from "lucide-react";

interface AddStockDialogProps {
  onSuccess: () => void;
}

export function AddStockDialog({ onSuccess }: AddStockDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newMovement, setNewMovement] = useState<AddMovementPayload>({
    materialName: "",
    materialType: "raw_materials",
    quantity: 0,
    unit: "",
    unitCost: 0,
    date: new Date().toISOString().split("T")[0],
    workOrderId: null,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewMovement((prev) => ({
      ...prev,
      [id]:
        id === "quantity" || id === "unitCost"
          ? parseFloat(value) || 0
          : id === "workOrderId"
          ? parseInt(value) || null
          : value,
    }));
  };

  const handleSelectChange = (value: "finished_goods" | "raw_materials") => {
    setNewMovement((prev) => ({
      ...prev,
      materialType: value,
    }));
  };

  const handleUnitSelectChange = (value: string) => {
    setNewMovement((prev) => ({
      ...prev,
      unit: value,
    }));
  };

  const handleAddMovement = async () => {
    try {
      await addStockMovement(newMovement);
      toast.success("Stock movement added successfully.");
      setIsDialogOpen(false);
      onSuccess();
      setNewMovement({
        materialName: "",
        materialType: "raw_materials",
        quantity: 0,
        unit: "",
        unitCost: 0,
        date: new Date().toISOString().split("T")[0],
        workOrderId: null,
      });
    } catch (err) {
      toast.error("Failed to add stock movement.");
      console.error(err);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          New <Plus />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Stock Movement</DialogTitle>
          <DialogDescription>
            Fill in the details for the new stock movement.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="materialName" className="text-right">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="materialName"
              value={newMovement.materialName}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="materialType" className="text-right">
              Material Type <span className="text-red-500">*</span>
            </Label>
            <Select
              value={newMovement.materialType}
              onValueChange={handleSelectChange}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a material type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="finished_goods">Finished Goods</SelectItem>
                <SelectItem value="raw_materials">Raw Materials</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="text-right">
              Quantity <span className="text-red-500">*</span>
            </Label>
            <div className="col-span-3">
              <Input
                id="quantity"
                type="number"
                value={newMovement.quantity}
                onChange={handleInputChange}
                className="w-full"
              />
              <span className="text-xs text-muted-foreground block mt-1">
                Put a minus ( - ) for reducing stock
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="unit" className="text-right">
              Unit <span className="text-red-500">*</span>
            </Label>
            <Select
              value={newMovement.unit}
              onValueChange={handleUnitSelectChange}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">Kg</SelectItem>
                <SelectItem value="gram">Gram</SelectItem>
                <SelectItem value="piece">Piece</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="unitCost" className="text-right">
              Unit Cost <span className="text-red-500">*</span>
            </Label>
            <Input
              id="unitCost"
              type="number"
              value={newMovement.unitCost}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Date
            </Label>
            <Input
              id="date"
              type="date"
              value={newMovement.date}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="workOrderId" className="text-right">
              Work Order ID
            </Label>
            <Input
              id="workOrderId"
              type="number"
              value={newMovement.workOrderId || ""}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleAddMovement}>
            Save Movement
          </Button>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
