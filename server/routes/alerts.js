import express from "express";
import mongoose from "mongoose";
import SpendingAlert from "../models/SpendingAlert.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// GET /api/alerts - List all alerts for the user, unread first, sorted by date
router.get("/", auth, async (req, res) => {
  try {
    const alerts = await SpendingAlert.find({ userId: req.user.id }).sort({
      isRead: 1,
      createdAt: -1,
    });
    res.json({ alerts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/alerts/:id/read - Mark an alert notification as read
router.patch("/:id/read", auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid alert ID" });
    }

    const alert = await SpendingAlert.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ message: "Alert not found or unauthorized" });
    }

    res.json({ alert });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/alerts/:id - Dismiss/delete an alert notification
router.delete("/:id", auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid alert ID" });
    }

    const alert = await SpendingAlert.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!alert) {
      return res.status(404).json({ message: "Alert not found or unauthorized" });
    }

    res.json({ message: "Alert dismissed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
