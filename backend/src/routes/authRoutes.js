import express from "express";
import { register } from "../controllers/authController.js";
import { verifyOtp, resendOtp } from "../controllers/otpControllers.js";
import { login } from "../controllers/loginControllers.js";






const router = express.Router();

router.post("/register", register);
router.post("/verify-otp", verifyOtp)
router.post("/resend-otp", resendOtp)
router.post("/login", login);


export default router;
