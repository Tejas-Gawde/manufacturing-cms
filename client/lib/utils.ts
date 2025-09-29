import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseID(prefix: string, id: string) {
  return prefix + "-" + id.toString();
}

export function parseType(type: string): string {
  if (type === "raw_materials") {
    return "Raw Materials";
  }
  return "Finished Goods";
}
