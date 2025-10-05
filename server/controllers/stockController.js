import { db } from "../db.js";
import { stockLedger } from "../schema/stockLedger.js";
import { and, asc, desc, eq, gte, ilike, lte, sql } from "drizzle-orm";

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
        unitCost: stockLedger.unitCost,
      })
      .from(stockLedger)
      .where(where)
      .groupBy(
        stockLedger.materialName,
        stockLedger.materialType,
        stockLedger.unit,
        stockLedger.unitCost
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

export async function getAvailableStockItems(req, res) {
  try {
    const { material_type, search } = req.query;

    const filters = [];
    if (material_type) {
      filters.push(eq(stockLedger.materialType, material_type));
    }
    if (search) {
      filters.push(ilike(stockLedger.materialName, `%${search}%`));
    }

    const where = filters.length ? and(...filters) : undefined;

    const stockItems = await db
      .select({
        materialName: stockLedger.materialName,
        materialType: stockLedger.materialType,
        balance: sql`SUM(${stockLedger.quantity})`.as("balance"),
        unit: stockLedger.unit,
        unitCost: sql`AVG(${stockLedger.unitCost})`.as("unitCost"),
        totalValue: sql`SUM(${stockLedger.quantity} * ${stockLedger.unitCost})`.as("totalValue"),
      })
      .from(stockLedger)
      .where(where)
      .groupBy(
        stockLedger.materialName,
        stockLedger.materialType,
        stockLedger.unit
      )
      .having(sql`SUM(${stockLedger.quantity}) > 0`)
      .orderBy(stockLedger.materialName);

    return res.json({ items: stockItems });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch available stock items" });
  }
}