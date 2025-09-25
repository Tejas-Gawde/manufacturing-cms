import express from "express";
import {
  listBOMs,
  createBOM,
  getBOMDetails,
} from "../controllers/bomController.js";

const router = express.Router();

router.get("/", listBOMs);
router.post("/", createBOM);
router.get("/:id", getBOMDetails);

export default router;
