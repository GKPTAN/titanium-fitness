import express from "express";
import { loginController, registroController, getUserIdController, verificationController } from "../controllers/authController.js";
const router = express.Router();

router.post("/login", loginController);
router.post("/registro", registroController);
router.get("/user_id", getUserIdController);
router.post("/verification", verificationController);

export default router;