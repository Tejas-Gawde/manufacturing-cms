import { http } from "./http";

export interface ManufacturingOrder {
  id: string;
  status: 'planned' | 'in_progress' | 'done' | 'canceled';
  deadline: string;
  bomId: number;
  workCenterId: number;
  createdBy: number;
  createdAt: string;
  bomName: string;
  workCenterName: string;
  creatorName: string;
}

export interface WorkOrder {
  id: string;
  moId: number;
  assignedTo?: number;
  status: 'pending' | 'started' | 'paused' | 'completed';
  stepName: string;
  estimatedTime: number;
  inheritedFromBom: boolean;
  startedAt?: string;
  completedAt?: string;
  comments?: string;
  createdAt: string;
  assignedUserName?: string;
}

export interface ManufacturingOrderDetails extends ManufacturingOrder {
  workOrders: WorkOrder[];
}

export interface CreateManufacturingOrderRequest {
  status: 'planned' | 'in_progress' | 'done' | 'canceled';
  deadline: string;
  bom_id: number;
  work_center_id: number;
  customWorkOrders?: {
    step_name: string;
    estimated_time: number;
  }[];
}

export async function getManufacturingOrders(): Promise<ManufacturingOrder[]> {
  const response = await http.get("/mos");
  return response.data.items;
}

export async function getManufacturingOrderDetails(id: string): Promise<ManufacturingOrderDetails> {
  const response = await http.get(`/mos/${id}`);
  return {
    ...response.data.item,
    workOrders: response.data.workOrders
  };
}

export async function createManufacturingOrder(
  mo: CreateManufacturingOrderRequest
): Promise<ManufacturingOrder> {
  const response = await http.post("/mos", mo);
  return response.data.item;
}

export async function updateManufacturingOrder(
  id: string,
  updates: Partial<{
    status: 'planned' | 'in_progress' | 'done' | 'canceled';
    deadline: string;
    work_center_id: number;
  }>
): Promise<ManufacturingOrder> {
  const response = await http.put(`/mos/${id}`, updates);
  return response.data.item;
}

export async function deleteManufacturingOrder(id: string): Promise<void> {
  await http.delete(`/mos/${id}`);
}
