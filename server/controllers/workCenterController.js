import { db } from "../db.js";
import { workCenters } from "../schema/workCenters.js";
import { eq } from "drizzle-orm";

export async function listWorkCenters(req, res) {
  try {
    const rows = await db.select().from(workCenters);
    return res.json({ items: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch work centers" });
  }
}

export async function createWorkCenter(req, res) {
  try {
    const { name, capacity, costPerHour } = req.body;
    if (
      !name ||
      typeof capacity !== "number" ||
      typeof costPerHour !== "number"
    ) {
      return res
        .status(400)
        .json({ error: "Name, capacity, and costPerHour are required" });
    }

    const [createdWorkCenter] = await db
      .insert(workCenters)
      .values({ name, capacity, costPerHour })
      .returning();

    return res.status(201).json({ item: createdWorkCenter });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to create work center" });
  }
}

export async function updateWorkCenter(req, res) {
  try {
    const { id } = req.params;
    const { name, capacity, costPerHour } = req.body;

    if (
      !name &&
      typeof capacity !== "number" &&
      typeof costPerHour !== "number"
    ) {
      return res
        .status(400)
        .json({
          error:
            "At least one field (name, capacity, or costPerHour) is required for update",
        });
    }

    const [updatedWorkCenter] = await db
      .update(workCenters)
      .set({
        name: name,
        capacity: capacity,
        costPerHour: costPerHour,
      })
      .where(eq(workCenters.id, id))
      .returning();

    if (!updatedWorkCenter) {
      return res.status(404).json({ error: "Work center not found" });
    }

    return res.json({ item: updatedWorkCenter });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to update work center" });
  }
}
