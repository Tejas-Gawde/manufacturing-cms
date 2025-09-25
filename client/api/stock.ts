import { http } from "./http";

export interface LedgerItem {
  id: number;
  date: string;
  materialName: string;
  materialType: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalValue: number;
  workOrderId: string | null;
  createdAt: string;
}

export interface BalanceItem {
  materialName: string;
  materialType: string;
  balance: number;
}

export interface ListStockParams {
  material?: string;
  from?: string;
  to?: string;
}

export async function listStockBalances(params?: ListStockParams) {
  const response = await http.get<{ items: BalanceItem[] }>("/stock", {
    params,
  });
  return response.data.items;
}

export async function listStockLedger(params?: ListStockParams) {
  const response = await http.get<{ items: LedgerItem[] }>("/stock/ledger", {
    params,
  });
  return response.data.items;
}

export interface AddMovementPayload {
  materialName: string;
  materialType: "finished_goods" | "raw_materials";
  quantity: number;
  unit: string;
  unitCost: number;
  date?: string;
  workOrderId?: number | null;
}

export async function addStockMovement(payload: AddMovementPayload) {
  const response = await http.post<{ item: LedgerItem }>(
    "/stock/movement",
    payload
  );
  return response.data.item;
}
