import express from "express";
import {
  forgotPassword,
  resetPassword,
  login,
  refreshToken,
  logout
} from "../controllers/authController.js";

const router = express.Router();

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/login", login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);

export default router;
