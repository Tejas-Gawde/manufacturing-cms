import { http } from "./http";

export interface WorkCenter {
  id: string;
  name: string;
  capacity: number;
  costPerHour: number;
}

export async function getWorkCenters(): Promise<WorkCenter[]> {
  const response = await http.get("/work-centers");
  return response.data.items;
}

export async function createWorkCenter(
  workCenter: Omit<WorkCenter, "id">
): Promise<WorkCenter> {
  const response = await http.post("/work-centers", workCenter);
  return response.data.item;
}

export async function updateWorkCenter(
  id: string,
  workCenter: Partial<Omit<WorkCenter, "id">>
): Promise<WorkCenter> {
  const response = await http.put(`/work-centers/${id}`, workCenter);
  return response.data.item;
}
