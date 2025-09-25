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
import { toast } from "sonner";
import { createWorkCenter, WorkCenter } from "@/api/workCenter";
import { Plus } from "lucide-react";

interface AddWorkCenterDialogProps {
  onSuccess: () => void;
}

export function AddWorkCenterDialog({ onSuccess }: AddWorkCenterDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newWorkCenter, setNewWorkCenter] = useState<
    Omit<WorkCenter, "id" | "created_at">
  >({
    name: "",
    capacity: 0,
    costPerHour: 0,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewWorkCenter((prev) => ({
      ...prev,
      [id]:
        id === "capacity" || id === "costPerHour"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleAddWorkCenter = async () => {
    try {
      await createWorkCenter(newWorkCenter);
      toast.success("Work center added successfully.");
      setIsDialogOpen(false);
      onSuccess();
      setNewWorkCenter({
        name: "",
        capacity: 0,
        costPerHour: 0,
      });
    } catch (err) {
      toast.error("Failed to add work center.");
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
          <DialogTitle>Add New Work Center</DialogTitle>
          <DialogDescription>
            Fill in the details for the new work center.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={newWorkCenter.name}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="capacity" className="text-right">
              Capacity <span className="text-red-500">*</span>
            </Label>
            <Input
              id="capacity"
              type="number"
              value={newWorkCenter.capacity}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="costPerHour" className="text-right">
              Cost Per Hour <span className="text-red-500">*</span>
            </Label>
            <Input
              id="costPerHour"
              type="number"
              value={newWorkCenter.costPerHour}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleAddWorkCenter}>
            Save Work Center
          </Button>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
