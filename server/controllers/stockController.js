import { db } from "../db.js";
import { stockLedger } from "../schema/stockLedger.js";
import { and, asc, desc, gte, ilike, lte, sql } from "drizzle-orm";

export async function listStock(req, res) {
  try {
    const { material, from, to } = req.query || {};

    const filters = [];
    if (material) {
      filters.push(ilike(stockLedger.materialName, `%${material}%`));
    }
    if (from) {
      filters.push(gte(stockLedger.date, new Date(from)));
    }
    if (to) {
      filters.push(lte(stockLedger.date, new Date(to)));
    }

    const where = filters.length ? and(...filters) : undefined;

    // Aggregate to current balance per item (by name and type)
    const rows = await db
      .select({
        materialName: stockLedger.materialName,
        materialType: stockLedger.materialType,
        balance: sql`SUM(${stockLedger.quantity})`.as("balance"),
        unit: stockLedger.unit,
        totalValue:
          sql`SUM(${stockLedger.quantity} * ${stockLedger.unitCost})`.as(
            "totalValue"
          ),
      })
      .from(stockLedger)
      .where(where)
      .groupBy(
        stockLedger.materialName,
        stockLedger.materialType,
        stockLedger.unit
      )
      .orderBy(desc(sql`SUM(${stockLedger.quantity})`));

    return res.json({ items: rows });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch stock balances" });
  }
}

export async function listLedger(req, res) {
  try {
    const { material, from, to } = req.query || {};

    const filters = [];
    if (material) {
      filters.push(ilike(stockLedger.materialName, `%${material}%`));
    }
    if (from) {
      filters.push(gte(stockLedger.date, new Date(from)));
    }
    if (to) {
      filters.push(lte(stockLedger.date, new Date(to)));
    }

    const where = filters.length ? and(...filters) : undefined;

    const rows = await db
      .select()
      .from(stockLedger)
      .where(where)
      .orderBy(asc(stockLedger.id));

    return res.json({ items: rows });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch stock ledger" });
  }
}

export async function addMovement(req, res) {
  try {
    const {
      materialName,
      materialType,
      quantity,
      date,
      workOrderId,
      unit,
      unitCost,
    } = req.body || {};
    if (!materialName || !materialType || typeof quantity !== "number") {
      return res
        .status(400)
        .json({
          error:
            "materialName, materialType, quantity, unit and unitCost are required",
        });
    }
    if (!["finished_goods", "raw_materials"].includes(materialType)) {
      return res.status(400).json({ error: "Invalid materialType" });
    }

    const values = {
      materialName,
      materialType,
      quantity,
      unit,
      unitCost,
      date: date ? new Date(date) : undefined,
      workOrderId: workOrderId ?? null,
    };

    const [created] = await db.insert(stockLedger).values(values).returning();
    return res.status(201).json({ item: created });
  } catch (err) {
    return res.status(500).json({ error: "Failed to add stock movement" });
  }
}
