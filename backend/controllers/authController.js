import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import crypto from "crypto";
import nodemailer from "nodemailer";
import redisClient from "../config/redisClient.js";
import Patient from "../models/patient.js";
import Employee from "../models/employee.js";
import LoginLog from "../models/logs.js"
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

const generateTokens = (user) => {
  const accessToken = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });
  const refreshToken = jwt.sign({ id: user._id }, JWT_REFRESH_SECRET, { expiresIn: "24h" });
  return { accessToken, refreshToken };
};

export const forgotPassword = async (req, res) => {
  const { email, userType } = req.body;

  try {
    const user = userType === "patient"
      ? await Patient.findOne({ email })
      : await Employee.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    const token = crypto.randomBytes(32).toString("hex");
    await redisClient.setEx(`reset:${token}`, 900, JSON.stringify({ email, userType }));

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "hmis.iitg@gmail.com",
        pass: "uymo hvwu hzgz ktrm",
      },
    });

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;
        await transporter.sendMail({
      from: '"MyApp Support" <hmis.iitg@gmail.com>',
      to: user.email,
      subject: "Password Reset",
      html: `<p>You requested a password reset</p><p><a href="${resetLink}">Click here to reset</a></p>`,
    });

    res.json({ message: "Reset link sent to your email." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const tokenData = await redisClient.get(`reset:${token}`);
    if (!tokenData) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    const { email, userType } = JSON.parse(tokenData);
    const user = userType === "patient"
      ? await Patient.findOne({ email })
      : await Employee.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found." });

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    await redisClient.del(`reset:${token}`);

    res.json({ message: "Password has been reset." });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const login = async (req, res) => {
  const { email, password, userType } = req.body;

  try {
    const user = userType === "patient"
      ? await Patient.findOne({ email })
      : await Employee.findOne({ email });

    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const { accessToken, refreshToken } = generateTokens(user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    // // Only log login for employees 
    // if (userType !== "patient") {
    //   const log = new LoginLog({
    //     user_id: user._id, 
    //     task: "login"
    //   });
    //   await log.save();
    // }


    res.json({ accessToken, role: user.role || "patient", user });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

export const refreshToken = (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ error: "No refresh token" });

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const accessToken = jwt.sign({ id: decoded.id }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ accessToken });
  } catch (err) {
    res.status(403).json({ error: "Invalid refresh token" });
  }
};

export const logout = async(req, res) => {

  const { userId } = req.body; //need to pass this from frontend

  // if (userId) {
  //   const log = new LoginLog({
  //     user_id: userId,
  //     task: "logout"
  //   });
  //   await log.save();
  // }

  try {
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to logout" });
  }
};
