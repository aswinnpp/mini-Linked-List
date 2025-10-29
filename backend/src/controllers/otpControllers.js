import User from "../models/User.js";
import Otp from "../models/Otp.js";
import nodemailer from "nodemailer";
import { generateOTP } from "../utils/jwt.js";

function createEmailTransporter() {
  return nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    pool: true,
    maxConnections: 1,
    connectionTimeout: 60000,
    greetingTimeout: 10000,
    socketTimeout: 60000,
  });
}




export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: "Email and OTP required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const otpRecord = await Otp.findOne({ userId: user._id, otp });
    if (!otpRecord) return res.status(400).json({ error: "Invalid OTP" });

    const now = new Date();
    const expiryTime = new Date(otpRecord.createdAt.getTime() + 5 * 60000); // 5 min
    if (now > expiryTime) return res.status(400).json({ error: "OTP expired" });
    user.emailIsAuthenticated = true
    user.save()

    await Otp.deleteOne({ _id: otpRecord._id });

   

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.emailIsAuthenticated) return res.status(200).json({ message: "Already verified" });

    const otp = generateOTP();
    await Otp.deleteMany({ userId: user._id });
    await Otp.create({ userId: user._id, otp });

    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        const transporter = createEmailTransporter();
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: "Your Email Verification OTP",
          html: `<p>Hi ${user.fullName},</p>
                 <p>Your 4-digit OTP is:</p>
                 <h2>${otp}</h2>
                 <p>It will expire in 10 minutes.</p>`
        });
      }
    } catch (e) {
      console.error('Failed to resend OTP email', e?.message || e);
    }

    return res.json({ message: "OTP resent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
