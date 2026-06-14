import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

const createToken = (user) =>
  jwt.sign(
    { id: user._id, email: user.email, name: user.name },
    process.env.JWT_SECRET || "dev-secret",
    { expiresIn: "7d" }
  );

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = await User.create({ name, email, password });
    const token = createToken(user);

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, wellnessProfile: user.wellnessProfile },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = createToken(user);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, wellnessProfile: user.wellnessProfile },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/me", async (req, res) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        dateOfBirth: user.dateOfBirth,
        college: user.college,
        course: user.course,
        semester: user.semester,
        wellnessProfile: user.wellnessProfile,
      },
    });
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
});

router.put("/profile", async (req, res) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");

    const { name, dateOfBirth, college, course, semester } = req.body;
    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (dateOfBirth !== undefined) updateFields.dateOfBirth = dateOfBirth || null;
    if (college !== undefined) updateFields.college = college;
    if (course !== undefined) updateFields.course = course;
    if (semester !== undefined) updateFields.semester = semester;

    const user = await User.findByIdAndUpdate(decoded.id, updateFields, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        dateOfBirth: user.dateOfBirth,
        college: user.college,
        course: user.course,
        semester: user.semester,
        wellnessProfile: user.wellnessProfile,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
