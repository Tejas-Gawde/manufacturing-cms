import { Router } from "express";
import {
  addMovement,
  listStock,
  listLedger,
} from "../controllers/stockController.js";

const router = Router();

router.get("/", listStock);
router.get("/ledger", listLedger);
router.post("/movement", addMovement);

export default router;
