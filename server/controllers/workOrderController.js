import { db } from "../db.js";
import { workOrders, manufacturingOrders } from "../schema/manufacturingOrders.js";
import { users } from "../schema/users.js";
import { eq, and, desc } from "drizzle-orm";

// List work orders with filters
export async function listWorkOrders(req, res) {
  try {
    const { status, assigned_to, mo_id } = req.query;
    
    let query = db
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
        moStatus: manufacturingOrders.status,
      })
      .from(workOrders)
      .leftJoin(users, eq(workOrders.assignedTo, users.id))
      .leftJoin(manufacturingOrders, eq(workOrders.moId, manufacturingOrders.id))
      .orderBy(desc(workOrders.createdAt));

    // Apply filters
    if (status) {
      query = query.where(eq(workOrders.status, status));
    }
    if (assigned_to) {
      query = query.where(eq(workOrders.assignedTo, assigned_to));
    }
    if (mo_id) {
      query = query.where(eq(workOrders.moId, mo_id));
    }

    const allWorkOrders = await query;
    return res.json({ items: allWorkOrders });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch work orders" });
  }
}

// Get work order details
export async function getWorkOrderDetails(req, res) {
  try {
    const { id } = req.params;

    const [workOrder] = await db
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
        moStatus: manufacturingOrders.status,
      })
      .from(workOrders)
      .leftJoin(users, eq(workOrders.assignedTo, users.id))
      .leftJoin(manufacturingOrders, eq(workOrders.moId, manufacturingOrders.id))
      .where(eq(workOrders.id, id));

    if (!workOrder) {
      return res.status(404).json({ error: "Work order not found" });
    }

    return res.json({ item: workOrder });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch work order details" });
  }
}

// Update work order (for operators to start, pause, complete)
export async function updateWorkOrder(req, res) {
  try {
    const { id } = req.params;
    const { status, assigned_to, comments } = req.body;
    const userId = req.user.id;

    // Check if work order exists
    const [existingWO] = await db
      .select()
      .from(workOrders)
      .where(eq(workOrders.id, id));

    if (!existingWO) {
      return res.status(404).json({ error: "Work order not found" });
    }

    // Validate status if provided
    if (status) {
      const validStatuses = ['pending', 'started', 'paused', 'completed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          error: "Invalid status. Must be one of: pending, started, paused, completed" 
        });
      }
    }

    // Prepare update data
    const updateData = {};
    if (status) {
      updateData.status = status;
      
      // Set timestamps based on status
      if (status === 'started' && !existingWO.startedAt) {
        updateData.startedAt = new Date();
      }
      if (status === 'completed') {
        updateData.completedAt = new Date();
      }
    }
    if (assigned_to !== undefined) {
      updateData.assignedTo = assigned_to;
    }
    if (comments !== undefined) {
      updateData.comments = comments;
    }

    // Update the work order
    const [updatedWO] = await db
      .update(workOrders)
      .set(updateData)
      .where(eq(workOrders.id, id))
      .returning();

    return res.json({ item: updatedWO });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to update work order" });
  }
}

// Assign work order to user
export async function assignWorkOrder(req, res) {
  try {
    const { id } = req.params;
    const { assigned_to } = req.body;

    if (!assigned_to) {
      return res.status(400).json({ error: "assigned_to is required" });
    }

    // Verify user exists
    const [user] = await db.select().from(users).where(eq(users.id, assigned_to));
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if work order exists
    const [existingWO] = await db
      .select()
      .from(workOrders)
      .where(eq(workOrders.id, id));

    if (!existingWO) {
      return res.status(404).json({ error: "Work order not found" });
    }

    // Update the work order
    const [updatedWO] = await db
      .update(workOrders)
      .set({ assignedTo: assigned_to })
      .where(eq(workOrders.id, id))
      .returning();

    return res.json({ item: updatedWO });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to assign work order" });
  }
}

// Get work orders for a specific user (operator dashboard)
export async function getMyWorkOrders(req, res) {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    let query = db
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
        moStatus: manufacturingOrders.status,
      })
      .from(workOrders)
      .leftJoin(manufacturingOrders, eq(workOrders.moId, manufacturingOrders.id))
      .where(eq(workOrders.assignedTo, userId))
      .orderBy(desc(workOrders.createdAt));

    // Apply status filter if provided
    if (status) {
      query = query.where(and(
        eq(workOrders.assignedTo, userId),
        eq(workOrders.status, status)
      ));
    }

    const myWorkOrders = await query;
    return res.json({ items: myWorkOrders });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch your work orders" });
  }
}
