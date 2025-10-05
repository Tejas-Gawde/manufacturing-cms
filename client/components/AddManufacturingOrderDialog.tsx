"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Package, Wrench } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AddMOFromBOM } from "./AddMOFromBOM";
import { AddMOManual } from "./AddMOManual";

interface AddManufacturingOrderDialogProps {
  onSuccess: () => void;
}

export function AddManufacturingOrderDialog({
  onSuccess,
}: AddManufacturingOrderDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [useBOM, setUseBOM] = useState(true);

  const handleSuccess = () => {
    setIsDialogOpen(false);
    onSuccess();
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          New <Plus className="ml-2 h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Create New Manufacturing Order</DialogTitle>
          <DialogDescription>
            Create a new manufacturing order using either a BOM template or
            manual configuration.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[calc(100vh-300px)] pr-4">
          <div className="flex flex-col gap-6">
            <div className="grid gap-4">
              <Label className="font-semibold text-base">Creation Mode</Label>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="use-bom"
                    checked={useBOM}
                    onCheckedChange={(checked) => setUseBOM(checked as boolean)}
                  />
                  <Label htmlFor="use-bom" className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Use BOM Template
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="manual-creation"
                    checked={!useBOM}
                    onCheckedChange={(checked) =>
                      setUseBOM(!(checked as boolean))
                    }
                  />
                  <Label
                    htmlFor="manual-creation"
                    className="flex items-center gap-2"
                  >
                    <Wrench className="h-4 w-4" />
                    Manual Creation
                  </Label>
                </div>
              </div>
            </div>

            {useBOM ? (
              <AddMOFromBOM onSuccess={handleSuccess} onCancel={handleCancel} />
            ) : (
              <AddMOManual onSuccess={handleSuccess} onCancel={handleCancel} />
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
