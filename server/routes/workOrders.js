import express from "express";
import {
  listWorkOrders,
  getWorkOrderDetails,
  updateWorkOrder,
  assignWorkOrder,
  getMyWorkOrders,
} from "../controllers/workOrderController.js";
import { authMiddleware } from "../utils/jwt.js";

const router = express.Router();


router.get("/", authMiddleware(["admin", "manager"]), listWorkOrders);
router.get("/my", getMyWorkOrders);
router.get("/:id", getWorkOrderDetails);
router.put("/:id", updateWorkOrder);
router.put("/:id/assign", authMiddleware(["admin", "manager"]), assignWorkOrder);

export default router;
