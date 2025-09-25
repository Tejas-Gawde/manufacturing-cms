import { db } from "../db.js";
import { boms } from "../schema/bom.js";
import { eq } from "drizzle-orm";

export async function listBOMs(req, res) {
  try {
    const allBOMs = await db.select().from(boms);
    return res.json({ items: allBOMs });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch BOMs" });
  }
}

export async function createBOM(req, res) {
  try {
    const { productName, components, workOrder } = req.body;

    if (
      !productName ||
      !components ||
      !Array.isArray(components) ||
      components.length === 0
    ) {
      return res
        .status(400)
        .json({ error: "Product name and components are required" });
    }

    const [newBOM] = await db
      .insert(boms)
      .values({ productName, components, workOrder })
      .returning();

    return res.status(201).json({ item: newBOM });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to create BOM" });
  }
}

export async function getBOMDetails(req, res) {
  try {
    const { id } = req.params;
    const [bomDetails] = await db.select().from(boms).where(eq(boms.id, id));

    if (!bomDetails) {
      return res.status(404).json({ error: "BOM not found" });
    }

    return res.json({ item: bomDetails });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch BOM details" });
  }
}
