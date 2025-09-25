import express from "express";
import {
  listWorkCenters,
  createWorkCenter,
  updateWorkCenter,
} from "../controllers/workCenterController.js";

const router = express.Router();

router.get("/", listWorkCenters);
router.post("/", createWorkCenter);
router.put("/:id", updateWorkCenter);

export default router;
