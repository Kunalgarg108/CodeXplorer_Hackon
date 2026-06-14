import express from "express";
import { auth } from "../middleware/auth.js";
import User from "../models/User.js";
import Fitness from "../models/Fitness.js";

const router = express.Router();

async function getUserId(req) {
  const user = await User.findOne({ email: req.user.email });
  return user?._id || null;
}

function calculateActivityScore(data) {
  let score = 0;
  if (data.steps >= 7000) score += 25;
  else if (data.steps >= 5000) score += 15;
  else if (data.steps > 0) score += 8;

  if (data.exerciseLevel === "intense") score += 30;
  else if (data.exerciseLevel === "moderate") score += 20;
  else if (data.exerciseLevel === "light") score += 10;

  if (data.sittingHours < 4) score += 15;
  else if (data.sittingHours < 6) score += 8;

  if (data.waterIntake >= 8) score += 15;
  else if (data.waterIntake >= 5) score += 10;

  if (data.outsideFood === "no") score += 15;
  else if (data.outsideFood === "once") score += 8;

  return score;
}

// GET / - get fitness data
router.get("/", auth, async (req, res) => {
  try {
    const userId = await getUserId(req);
    if (!userId) return res.status(404).json({ message: "User not found" });
    let fitness = await Fitness.findOne({ userId });
    if (!fitness) fitness = await Fitness.create({ userId });
    res.json(fitness);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// POST /assessment - submit daily assessment
router.post("/assessment", auth, async (req, res) => {
  try {
    const userId = await getUserId(req);
    if (!userId) return res.status(404).json({ message: "User not found" });
    let fitness = await Fitness.findOne({ userId });
    if (!fitness) fitness = await Fitness.create({ userId });

    const { studyHours, sittingHours, outsideFood, waterIntake, exerciseLevel, steps } = req.body;
    const activityScore = calculateActivityScore({ steps: Number(steps) || 0, exerciseLevel: exerciseLevel || "no", sittingHours: Number(sittingHours) || 0, waterIntake: Number(waterIntake) || 0, outsideFood: outsideFood || "no" });

    const assessment = { date: new Date(), studyHours: Number(studyHours) || 0, sittingHours: Number(sittingHours) || 0, outsideFood: outsideFood || "no", waterIntake: Number(waterIntake) || 0, exerciseLevel: exerciseLevel || "no", steps: Number(steps) || 0, activityScore };

    const todayStr = new Date().toDateString();
    const idx = fitness.dailyAssessments.findIndex((a) => new Date(a.date).toDateString() === todayStr);
    if (idx > -1) fitness.dailyAssessments[idx] = { ...fitness.dailyAssessments[idx].toObject(), ...assessment };
    else fitness.dailyAssessments.push(assessment);

    // Streak logic
    if (exerciseLevel && exerciseLevel !== "no") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);

      if (fitness.lastWorkoutDate) {
        const last = new Date(fitness.lastWorkoutDate);
        const lastDay = new Date(last.getFullYear(), last.getMonth(), last.getDate());
        if (lastDay.getTime() === today.getTime()) { /* already counted */ }
        else if (lastDay.getTime() === yesterday.getTime()) fitness.currentStreak += 1;
        else fitness.currentStreak = 1;
      } else { fitness.currentStreak = 1; }

      if (fitness.currentStreak > fitness.longestStreak) fitness.longestStreak = fitness.currentStreak;
      if (!fitness.lastWorkoutDate || new Date(fitness.lastWorkoutDate).toDateString() !== todayStr) fitness.totalWorkoutDays += 1;
      fitness.lastWorkoutDate = now;
    }

    await fitness.save();
    res.json(fitness);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// PUT /step-goal
router.put("/step-goal", auth, async (req, res) => {
  try {
    const userId = await getUserId(req);
    if (!userId) return res.status(404).json({ message: "User not found" });
    let fitness = await Fitness.findOne({ userId });
    if (!fitness) fitness = await Fitness.create({ userId });
    fitness.stepGoal = Number(req.body.stepGoal) || 7000;
    await fitness.save();
    res.json(fitness);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

export default router;
