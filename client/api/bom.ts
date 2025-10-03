import { http } from "./http";

export interface BOMComponent {
  materialId: string;
  quantity: number;
}

export interface WorkOrderForBOM {
  workOrderName: string;
  time: number;
}

export interface BOM {
  id: string;
  productName: string;
  quantity: number;
  components: BOMComponent[];
  workOrder: WorkOrderForBOM[];
  createdAt: string;
}

export async function getBOMs(): Promise<BOM[]> {
  const response = await http.get("/boms");
  return response.data.items;
}

export async function createBOM(
  bom: Omit<BOM, "id" | "createdAt">
): Promise<BOM> {
  const response = await http.post("/boms", bom);
  return response.data.item;
}

export async function getBOMDetails(id: string): Promise<BOM> {
  const response = await http.get(`/boms/${id}`);
  return response.data.item;
}
