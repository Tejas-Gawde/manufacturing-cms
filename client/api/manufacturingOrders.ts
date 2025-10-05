import { http } from "./http";

export interface ManufacturingOrder {
  id: string;
  status: 'planned' | 'in_progress' | 'done' | 'canceled';
  deadline: string;
  bomId: number | null;
  workCenterId: number;
  createdBy: number;
  createdAt: string;
  components: Component[];
  workOrders: WorkOrderStep[];
  productName?: string;
  bomName: string;
  workCenterName: string;
  creatorName: string;
}

export interface Component {
  material_name: string;
  materialId?: string;
  qty: number;
  unit: string;
  unit_cost: number;
  quantity?: number;
}

export interface WorkOrderStep {
  step_name: string;
  estimated_time: number;
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

export interface ManufacturingOrderDetails extends Omit<ManufacturingOrder, 'workOrders'> {
  workOrders: WorkOrder[];
}

export interface CreateManufacturingOrderRequest {
  status: 'planned' | 'in_progress' | 'done' | 'canceled';
  deadline: string;
  work_center_id: number;
  // BOM-based creation
  bom_id?: number;
  // Manual creation
  components?: Component[];
  work_orders?: WorkOrderStep[];
  product_name?: string; // required for manual creation
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
