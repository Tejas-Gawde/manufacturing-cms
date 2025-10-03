import { db } from "../db.js";
import { manufacturingOrders, workOrders } from "../schema/manufacturingOrders.js";
import { boms } from "../schema/bom.js";
import { workCenters } from "../schema/workCenters.js";
import { users } from "../schema/users.js";
import { eq, and, desc } from "drizzle-orm";

export async function listManufacturingOrders(req, res) {
  try {
    const { status, work_center_id, created_by } = req.query;
    
    let query = db
      .select({
        id: manufacturingOrders.id,
        status: manufacturingOrders.status,
        deadline: manufacturingOrders.deadline,
        bomId: manufacturingOrders.bomId,
        workCenterId: manufacturingOrders.workCenterId,
        createdBy: manufacturingOrders.createdBy,
        createdAt: manufacturingOrders.createdAt,
        bomName: boms.productName,
        workCenterName: workCenters.name,
        creatorName: users.name,
      })
      .from(manufacturingOrders)
      .leftJoin(boms, eq(manufacturingOrders.bomId, boms.id))
      .leftJoin(workCenters, eq(manufacturingOrders.workCenterId, workCenters.id))
      .leftJoin(users, eq(manufacturingOrders.createdBy, users.id))
      .orderBy(desc(manufacturingOrders.createdAt));

    // Apply filters
    if (status) {
      query = query.where(eq(manufacturingOrders.status, status));
    }
    if (work_center_id) {
      query = query.where(eq(manufacturingOrders.workCenterId, work_center_id));
    }
    if (created_by) {
      query = query.where(eq(manufacturingOrders.createdBy, created_by));
    }

    const allMOs = await query;
    return res.json({ items: allMOs });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch manufacturing orders" });
  }
}

export async function createManufacturingOrder(req, res) {
  try {
    const { status, deadline, bom_id, work_center_id, customWorkOrders } = req.body;
    const createdBy = req.user.id;

    if (!status || !deadline || !bom_id || !work_center_id) {
      return res.status(400).json({ 
        error: "Status, deadline, bom_id, and work_center_id are required" 
      });
    }

    const validStatuses = ['planned', 'in_progress', 'done', 'canceled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: "Invalid status. Must be one of: planned, in_progress, done, canceled" 
      });
    }

    const [bom] = await db.select().from(boms).where(eq(boms.id, bom_id));
    if (!bom) {
      return res.status(404).json({ error: "BOM not found" });
    }

    const [workCenter] = await db.select().from(workCenters).where(eq(workCenters.id, work_center_id));
    if (!workCenter) {
      return res.status(404).json({ error: "Work center not found" });
    }

    const [newMO] = await db
      .insert(manufacturingOrders)
      .values({
        status,
        deadline: new Date(deadline),
        bomId: bom_id,
        workCenterId: work_center_id,
        createdBy,
      })
      .returning();

    const bomWorkOrders = bom.workOrder || [];
    const workOrdersToCreate = [];

    for (const bomStep of bomWorkOrders) {
      workOrdersToCreate.push({
        moId: newMO.id,
        stepName: bomStep.step_name || bomStep.name,
        estimatedTime: bomStep.time || bomStep.estimated_time,
        inheritedFromBom: true,
        status: 'pending',
      });
    }

    if (customWorkOrders && Array.isArray(customWorkOrders)) {
      for (const customStep of customWorkOrders) {
        if (customStep.step_name && customStep.estimated_time) {
          workOrdersToCreate.push({
            moId: newMO.id,
            stepName: customStep.step_name,
            estimatedTime: customStep.estimated_time,
            inheritedFromBom: false,
            status: 'pending',
          });
        }
      }
    }

    if (workOrdersToCreate.length > 0) {
      await db.insert(workOrders).values(workOrdersToCreate);
    }

    const [createdMO] = await db
      .select({
        id: manufacturingOrders.id,
        status: manufacturingOrders.status,
        deadline: manufacturingOrders.deadline,
        bomId: manufacturingOrders.bomId,
        workCenterId: manufacturingOrders.workCenterId,
        createdBy: manufacturingOrders.createdBy,
        createdAt: manufacturingOrders.createdAt,
        bomName: boms.productName,
        workCenterName: workCenters.name,
        creatorName: users.name,
      })
      .from(manufacturingOrders)
      .leftJoin(boms, eq(manufacturingOrders.bomId, boms.id))
      .leftJoin(workCenters, eq(manufacturingOrders.workCenterId, workCenters.id))
      .leftJoin(users, eq(manufacturingOrders.createdBy, users.id))
      .where(eq(manufacturingOrders.id, newMO.id));

    return res.status(201).json({ item: createdMO });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to create manufacturing order" });
  }
}

export async function getManufacturingOrderDetails(req, res) {
  try {
    const { id } = req.params;

    const [moDetails] = await db
      .select({
        id: manufacturingOrders.id,
        status: manufacturingOrders.status,
        deadline: manufacturingOrders.deadline,
        bomId: manufacturingOrders.bomId,
        workCenterId: manufacturingOrders.workCenterId,
        createdBy: manufacturingOrders.createdBy,
        createdAt: manufacturingOrders.createdAt,
        bomName: boms.productName,
        workCenterName: workCenters.name,
        creatorName: users.name,
      })
      .from(manufacturingOrders)
      .leftJoin(boms, eq(manufacturingOrders.bomId, boms.id))
      .leftJoin(workCenters, eq(manufacturingOrders.workCenterId, workCenters.id))
      .leftJoin(users, eq(manufacturingOrders.createdBy, users.id))
      .where(eq(manufacturingOrders.id, id));

    if (!moDetails) {
      return res.status(404).json({ error: "Manufacturing order not found" });
    }

    const associatedWorkOrders = await db
      .select({
        id: workOrders.id,
        moId: workOrders.moId,
        assignedTo: workOrders.assignedTo,
        status: workOrders.status,
        stepName: workOrders.stepName,
        estimatedTime: workOrders.estimatedTime,
        inheritedFromBom: workOrders.inheritedFromBom,
        startedAt: workOrders.startedAt,
        completedAt: workOrders.completedAt,
        comments: workOrders.comments,
        createdAt: workOrders.createdAt,
        assignedUserName: users.name,
      })
      .from(workOrders)
      .leftJoin(users, eq(workOrders.assignedTo, users.id))
      .where(eq(workOrders.moId, id))
      .orderBy(workOrders.createdAt);

    return res.json({ 
      item: moDetails,
      workOrders: associatedWorkOrders 
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch manufacturing order details" });
  }
}

export async function updateManufacturingOrder(req, res) {
  try {
    const { id } = req.params;
    const { status, deadline, work_center_id } = req.body;

    const [existingMO] = await db
      .select()
      .from(manufacturingOrders)
      .where(eq(manufacturingOrders.id, id));

    if (!existingMO) {
      return res.status(404).json({ error: "Manufacturing order not found" });
    }

    if (status) {
      const validStatuses = ['planned', 'in_progress', 'done', 'canceled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          error: "Invalid status. Must be one of: planned, in_progress, done, canceled" 
        });
      }
    }

    if (work_center_id) {
      const [workCenter] = await db.select().from(workCenters).where(eq(workCenters.id, work_center_id));
      if (!workCenter) {
        return res.status(404).json({ error: "Work center not found" });
      }
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (deadline) updateData.deadline = new Date(deadline);
    if (work_center_id) updateData.workCenterId = work_center_id;

    const [updatedMO] = await db
      .update(manufacturingOrders)
      .set(updateData)
      .where(eq(manufacturingOrders.id, id))
      .returning();

    return res.json({ item: updatedMO });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to update manufacturing order" });
  }
}

export async function deleteManufacturingOrder(req, res) {
  try {
    const { id } = req.params;

    const [existingMO] = await db
      .select()
      .from(manufacturingOrders)
      .where(eq(manufacturingOrders.id, id));

    if (!existingMO) {
      return res.status(404).json({ error: "Manufacturing order not found" });
    }

    await db.delete(workOrders).where(eq(workOrders.moId, id));

    await db.delete(manufacturingOrders).where(eq(manufacturingOrders.id, id));

    return res.json({ message: "Manufacturing order deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to delete manufacturing order" });
  }
}
