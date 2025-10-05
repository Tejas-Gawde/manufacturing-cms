import { db } from "../db.js";
import { manufacturingOrders } from "../schema/manufacturingOrders.js";
import { workOrders } from "../schema/workOrders.js";
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
        components: manufacturingOrders.components,
        workOrders: manufacturingOrders.workOrders,
        productName: manufacturingOrders.productName,
        bomName: boms.productName,
        workCenterName: workCenters.name,
        creatorName: users.name,
      })
      .from(manufacturingOrders)
      .leftJoin(boms, eq(manufacturingOrders.bomId, boms.id))
      .leftJoin(workCenters, eq(manufacturingOrders.workCenterId, workCenters.id))
      .leftJoin(users, eq(manufacturingOrders.createdBy, users.id))
      .orderBy(desc(manufacturingOrders.createdAt));

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
    const { 
      status, 
      deadline, 
      bom_id, 
      work_center_id, 
      components, 
      work_orders,
      product_name,
    } = req.body;
    const createdBy = req.user.id;

    if (!status || !deadline || !work_center_id) {
      return res.status(400).json({ 
        error: "Status, deadline, and work_center_id are required" 
      });
    }

    const validStatuses = ['planned', 'in_progress', 'done', 'canceled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: "Invalid status. Must be one of: planned, in_progress, done, canceled" 
      });
    }

    const [workCenter] = await db.select().from(workCenters).where(eq(workCenters.id, work_center_id));
    if (!workCenter) {
      return res.status(404).json({ error: "Work center not found" });
    }

    let finalComponents = [];
    let finalWorkOrders = [];
    let bomId = null;
    let finalProductName = null;

    if (bom_id) {
      const [bom] = await db.select().from(boms).where(eq(boms.id, bom_id));
      if (!bom) {
        return res.status(404).json({ error: "BOM not found" });
      }

      bomId = bom_id;
      finalComponents = bom.components || [];
      finalWorkOrders = bom.workOrder || [];
      finalProductName = bom.productName || null;
      
    } else {
      if (!product_name || typeof product_name !== 'string' || product_name.trim() === '') {
        return res.status(400).json({ 
          error: "product_name is required for manual MO creation" 
        });
      }
      if (!components || !Array.isArray(components) || components.length === 0) {
        return res.status(400).json({ 
          error: "Components are required for manual MO creation" 
        });
      }

      if (!work_orders || !Array.isArray(work_orders) || work_orders.length === 0) {
        return res.status(400).json({ 
          error: "Work orders are required for manual MO creation" 
        });
      }

      for (const component of components) {
        if (!component.material_name || !component.qty || !component.unit || !component.unit_cost) {
          return res.status(400).json({ 
            error: "Each component must have material_name, qty, unit, and unit_cost" 
          });
        }
      }

      for (const workOrder of work_orders) {
        if (!workOrder.step_name || !workOrder.estimated_time) {
          return res.status(400).json({ 
            error: "Each work order must have step_name and estimated_time" 
          });
        }
      }

      finalComponents = components;
      finalWorkOrders = work_orders;
      finalProductName = product_name.trim();
    }

    const [newMO] = await db
      .insert(manufacturingOrders)
      .values({
        status,
        deadline: new Date(deadline),
        bomId: bomId,
        workCenterId: work_center_id,
        createdBy,
        productName: finalProductName,
        components: finalComponents,
        workOrders: finalWorkOrders,
      })
      .returning();

    if (finalWorkOrders && finalWorkOrders.length > 0) {
        const workOrdersToCreate = finalWorkOrders.map((wo, index) => {
          const stepName = wo.workOrderName || wo.step_name || wo.name || wo.stepName;
          const estimatedTime = wo.estimated_time || wo.time || wo.estimatedTime || 0;
        
        if (!stepName || stepName.trim() === '') {
          throw new Error(`Invalid work order at index ${index}: step name is required. Available fields: ${JSON.stringify(Object.keys(wo))}`);
        }
        
        if (estimatedTime <= 0) {
          throw new Error(`Invalid work order at index ${index}: estimated time must be greater than 0`);
        }
        
        return {
          moId: newMO.id,
          stepName: stepName.trim(),
          estimatedTime: Math.round(estimatedTime),
          inheritedFromBom: bom_id ? true : false,
          status: 'pending',
        };
      });

      if (workOrdersToCreate.length > 0) {
        try {
          await db.insert(workOrders).values(workOrdersToCreate);
        } catch (insertError) {
          console.error("Error inserting work orders:", insertError);
          console.error("Work orders data:", JSON.stringify(workOrdersToCreate, null, 2));
          throw new Error(`Failed to create work orders: ${insertError.message}`);
        }
      }
    } else {
      const defaultWorkOrder = {
        moId: newMO.id,
        stepName: "Default Work Step",
        estimatedTime: 60,
        inheritedFromBom: bom_id ? true : false,
        status: 'pending',
      };
      
      try {
        await db.insert(workOrders).values([defaultWorkOrder]);
      } catch (insertError) {
        console.error("Error inserting default work order:", insertError);
        console.error("Default work order data:", JSON.stringify(defaultWorkOrder, null, 2));
        throw new Error(`Failed to create default work order: ${insertError.message}`);
      }
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
        components: manufacturingOrders.components,
        workOrders: manufacturingOrders.workOrders,
        productName: manufacturingOrders.productName,
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
        components: manufacturingOrders.components,
        workOrders: manufacturingOrders.workOrders,
        productName: manufacturingOrders.productName,
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

export async function getBOMForMO(req, res) {
  try {
    const { bom_id } = req.params;

    const [bom] = await db
      .select({
        id: boms.id,
        productName: boms.productName,
        quantity: boms.quantity,
        components: boms.components,
        workOrder: boms.workOrder,
      })
      .from(boms)
      .where(eq(boms.id, bom_id));

    if (!bom) {
      return res.status(404).json({ error: "BOM not found" });
    }

    return res.json({ item: bom });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch BOM details" });
  }
}
