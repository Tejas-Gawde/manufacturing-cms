import express from "express";
import {
  listManufacturingOrders,
  createManufacturingOrder,
  getManufacturingOrderDetails,
  updateManufacturingOrder,
  deleteManufacturingOrder,
  getBOMForMO,
} from "../controllers/manufacturingOrderController.js";
import { authMiddleware } from "../utils/jwt.js";

const router = express.Router();

router.use(authMiddleware());

router.get("/", listManufacturingOrders);
router.post("/", authMiddleware(["admin", "manager"]), createManufacturingOrder);
router.get("/bom/:bom_id", getBOMForMO);
router.get("/:id", getManufacturingOrderDetails);
router.put("/:id", authMiddleware(["admin", "manager"]), updateManufacturingOrder);
router.delete("/:id", authMiddleware(["admin"]), deleteManufacturingOrder);

export default router;
