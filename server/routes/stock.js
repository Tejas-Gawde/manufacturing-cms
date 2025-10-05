import { Router } from "express";
import {
  addMovement,
  listStock,
  listLedger,
  getAvailableStockItems,
} from "../controllers/stockController.js";

const router = Router();

router.get("/", listStock);
router.get("/ledger", listLedger);
router.get("/available", getAvailableStockItems);
router.post("/movement", addMovement);

export default router;
