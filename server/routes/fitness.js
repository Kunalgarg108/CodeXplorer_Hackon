import express from "express";
import OpenAI from "openai";
import { auth } from "../middleware/auth.js";
import User from "../models/User.js";
import Fitness from "../models/Fitness.js";

const router = express.Router();

// Helper: get user's MongoDB _id from email in token
async function getUserId(req) {
  const user = await User.findOne({ email: req.user.email });
  if (!user) return null;
  return user._id;
}

// Helper: calculate activity score from assessment data
function calculateActivityScore(data) {
  let score = 0;

  // Steps scoring
  if (data.steps >= 7000) score += 25;
  else if (data.steps >= 5000) score += 15;
  else if (data.steps > 0) score += 8;

  // Exercise level scoring
  if (data.exerciseLevel === "intense") score += 30;
  else if (data.exerciseLevel === "moderate") score += 20;
  else if (data.exerciseLevel === "light") score += 10;

  // Sitting hours scoring
  if (data.sittingHours < 4) score += 15;
  else if (data.sittingHours < 6) score += 8;

  // Water intake scoring
  if (data.waterIntake >= 8) score += 15;
  else if (data.waterIntake >= 5) score += 10;

  // Outside food scoring
  if (data.outsideFood === "no") score += 15;
  else if (data.outsideFood === "once") score += 8;

  return score;
}

// GET / - get user's fitness data (create if not exists)
router.get("/", auth, async (req, res) => {
  try {
    const userId = await getUserId(req);
    if (!userId) return res.status(404).json({ message: "User not found" });

    let fitness = await Fitness.findOne({ userId });
    if (!fitness) {
      fitness = await Fitness.create({ userId });
    }

    res.json(fitness);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /assessment - submit daily assessment
router.post("/assessment", auth, async (req, res) => {
  try {
    const userId = await getUserId(req);
    if (!userId) return res.status(404).json({ message: "User not found" });

    let fitness = await Fitness.findOne({ userId });
    if (!fitness) {
      fitness = await Fitness.create({ userId });
    }

    const { studyHours, sittingHours, outsideFood, waterIntake, exerciseLevel, steps } = req.body;

    const activityScore = calculateActivityScore({
      steps: Number(steps) || 0,
      exerciseLevel: exerciseLevel || "no",
      sittingHours: Number(sittingHours) || 0,
      waterIntake: Number(waterIntake) || 0,
      outsideFood: outsideFood || "no",
    });

    const assessment = {
      date: new Date(),
      studyHours: Number(studyHours) || 0,
      sittingHours: Number(sittingHours) || 0,
      outsideFood: outsideFood || "no",
      waterIntake: Number(waterIntake) || 0,
      exerciseLevel: exerciseLevel || "no",
      steps: Number(steps) || 0,
      activityScore,
    };

    // Check if assessment already exists for today
    const todayStr = new Date().toDateString();
    const existingIdx = fitness.dailyAssessments.findIndex(
      (a) => new Date(a.date).toDateString() === todayStr
    );

    if (existingIdx > -1) {
      fitness.dailyAssessments[existingIdx] = { ...fitness.dailyAssessments[existingIdx].toObject(), ...assessment };
    } else {
      fitness.dailyAssessments.push(assessment);
    }

    // Streak logic
    if (exerciseLevel && exerciseLevel !== "no") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (fitness.lastWorkoutDate) {
        const lastWorkout = new Date(fitness.lastWorkoutDate);
        const lastWorkoutDay = new Date(lastWorkout.getFullYear(), lastWorkout.getMonth(), lastWorkout.getDate());

        if (lastWorkoutDay.getTime() === today.getTime()) {
          // Already counted today, no change to streak
        } else if (lastWorkoutDay.getTime() === yesterday.getTime()) {
          // Consecutive day - increment streak
          fitness.currentStreak += 1;
        } else {
          // Gap of more than 1 day - reset streak
          fitness.currentStreak = 1;
        }
      } else {
        // First workout ever
        fitness.currentStreak = 1;
      }

      // Update longest streak
      if (fitness.currentStreak > fitness.longestStreak) {
        fitness.longestStreak = fitness.currentStreak;
      }

      // Only increment totalWorkoutDays if this is a new day
      if (!fitness.lastWorkoutDate || new Date(fitness.lastWorkoutDate).toDateString() !== todayStr) {
        fitness.totalWorkoutDays += 1;
      }

      fitness.lastWorkoutDate = now;
    }

    await fitness.save();
    res.json(fitness);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /goals - create a fitness goal
router.post("/goals", auth, async (req, res) => {
  try {
    const userId = await getUserId(req);
    if (!userId) return res.status(404).json({ message: "User not found" });

    let fitness = await Fitness.findOne({ userId });
    if (!fitness) {
      fitness = await Fitness.create({ userId });
    }

    const { title, target, unit } = req.body;
    if (!title || !target) {
      return res.status(400).json({ message: "Title and target are required" });
    }

    fitness.goals.push({ title, target: Number(target), unit: unit || "times" });
    await fitness.save();

    res.json(fitness);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /goals/:id - update goal progress
router.put("/goals/:id", auth, async (req, res) => {
  try {
    const userId = await getUserId(req);
    if (!userId) return res.status(404).json({ message: "User not found" });

    const fitness = await Fitness.findOne({ userId });
    if (!fitness) return res.status(404).json({ message: "Fitness profile not found" });

    const goal = fitness.goals.id(req.params.id);
    if (!goal) return res.status(404).json({ message: "Goal not found" });

    if (req.body.current !== undefined) goal.current = Number(req.body.current);
    if (req.body.title) goal.title = req.body.title;
    if (req.body.target) goal.target = Number(req.body.target);
    if (req.body.unit) goal.unit = req.body.unit;

    await fitness.save();
    res.json(fitness);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /goals/:id - delete a goal
router.delete("/goals/:id", auth, async (req, res) => {
  try {
    const userId = await getUserId(req);
    if (!userId) return res.status(404).json({ message: "User not found" });

    const fitness = await Fitness.findOne({ userId });
    if (!fitness) return res.status(404).json({ message: "Fitness profile not found" });

    const goal = fitness.goals.id(req.params.id);
    if (!goal) return res.status(404).json({ message: "Goal not found" });

    goal.deleteOne();
    await fitness.save();

    res.json(fitness);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /step-goal - update daily step goal
router.put("/step-goal", auth, async (req, res) => {
  try {
    const userId = await getUserId(req);
    if (!userId) return res.status(404).json({ message: "User not found" });

    let fitness = await Fitness.findOne({ userId });
    if (!fitness) {
      fitness = await Fitness.create({ userId });
    }

    const { stepGoal } = req.body;
    if (!stepGoal || stepGoal < 0) {
      return res.status(400).json({ message: "Valid step goal is required" });
    }

    fitness.stepGoal = Number(stepGoal);
    await fitness.save();

    res.json(fitness);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /generate-workout - use AI to generate a workout plan
router.post("/generate-workout", auth, async (req, res) => {
  try {
    const { goal, duration, location, equipment } = req.body;

    const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: "AI API key not configured" });
    }

    const openai = new OpenAI({ apiKey, baseURL: "https://openrouter.ai/api/v1" });

    const prompt = `Generate a workout plan based on the following inputs:
- Goal: ${goal || "general fitness"}
- Available time: ${duration || "30"} minutes
- Location: ${location || "home"}
- Equipment: ${equipment || "none"}

Respond ONLY with valid JSON in this exact format (no markdown, no extra text):
{
  "warmup": ["exercise 1 - duration/reps", "exercise 2 - duration/reps"],
  "mainWorkout": ["exercise 1 - sets x reps", "exercise 2 - sets x reps"],
  "cooldown": ["exercise 1 - duration", "exercise 2 - duration"],
  "totalDuration": "X min"
}

Make the workout practical, safe, and appropriate for the given constraints.`;

    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return res.status(500).json({ message: "Failed to generate workout plan" });
    }

    // Parse AI response - handle possible markdown code blocks
    let workoutPlan;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      workoutPlan = JSON.parse(cleaned);
    } catch {
      return res.status(500).json({ message: "Failed to parse workout plan", raw: content });
    }

    res.json(workoutPlan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
