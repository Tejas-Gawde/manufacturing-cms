import { http } from "./http";

export type WorkOrderStatus = 'pending' | 'started' | 'paused' | 'completed';
export type MOStatus = 'planned' | 'in_progress' | 'done' | 'canceled';

export interface WorkOrderListItem {
  id: string;
  moId: number;
  assignedTo?: number;
  status: WorkOrderStatus;
  stepName: string;
  estimatedTime: number;
  inheritedFromBom: boolean;
  startedAt?: string;
  completedAt?: string;
  comments?: string;
  createdAt: string;
  assignedUserName?: string;
  moStatus: MOStatus;
}

export interface ListWorkOrdersParams {
  status?: WorkOrderStatus;
  assigned_to?: number;
  mo_id?: number;
}

export async function listWorkOrders(params?: ListWorkOrdersParams): Promise<WorkOrderListItem[]> {
  const response = await http.get("/work-orders", { params });
  return response.data.items;
}


