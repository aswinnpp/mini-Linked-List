import User from "../models/User.js";
import Otp from "../models/Otp.js";
import { hashPassword } from "../utils/hash.js";
import {generateOTP} from "../utils/jwt.js"

import nodemailer from "nodemailer";
function createEmailTransporter() {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,                       
    secure: true,                    
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,  
    },
    pool: true,
    maxConnections: 1,
    connectionTimeout: 60000,
    greetingTimeout: 10000,
    socketTimeout: 60000,
    tls: {
      rejectUnauthorized: true
    }
  });
}
export const register = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    console.log("sddsaddvsd",req.body);
    

    const existing = await User.findOne({ email });
    if (existing) {
      
      if (!existing.emailIsAuthenticated) {
        const otp = generateOTP();
        await Otp.deleteMany({ userId: existing._id });
        await Otp.create({ userId: existing._id, otp });

        const transporter = createEmailTransporter();

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: existing.email,
          subject: "Your Email Verification OTP",
          html: `<p>Hi ${existing.fullName},</p>
                 <p>Your 4-digit OTP is:</p>
                 <h2>${otp}</h2>
                 <p>It will expire in 10 minutes.</p>`,
        };

        try {
          await transporter.sendMail(mailOptions);
        } catch (e) {
          // Log but do not expose transporter internals to client
          console.error('Failed to resend OTP email', e?.message || e);
        }

        return res.status(200).json({
          message: "Account exists but not verified. We sent a new OTP to your email.",
          email: existing.email,
        });
      }
      return res.status(400).json({ error: "Email already in use" });
    }

    const hashed = await hashPassword(password);
    const user = await User.create({ fullName, email, password: hashed, role, isVerified: false });

    const otp = generateOTP();

   
    await Otp.create({ userId: user._id, otp });

    
    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        const transporter = createEmailTransporter();

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: "Your Email Verification OTP",
          html: `<p>Hi ${user.fullName},</p>
                 <p>Your 4-digit OTP is:</p>
                 <h2>${otp}</h2>
                 <p>It will expire in 10 minutes.</p>`,
        };

        await transporter.sendMail(mailOptions);
      } else {
        console.warn('EMAIL_USER/EMAIL_PASS not configured; skipping OTP email send');
      }
    } catch (e) {
      console.error('Failed to send OTP email', e?.message || e);
    }

    res.status(201).json({
      message: "User registered. Please check your email for the OTP.",
      email: user.email,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};