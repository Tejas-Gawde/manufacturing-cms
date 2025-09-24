import { Router } from "express";
import {
  signup,
  login,
  refresh,
  forgotPassword,
  logout,
} from "../controllers/authController.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/forgot-password", forgotPassword);
router.post("/logout", logout);

export default router;
