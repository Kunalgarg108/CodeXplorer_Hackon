import mongoose from "mongoose";

const dailyAssessmentSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  studyHours: { type: Number, default: 0 },
  sittingHours: { type: Number, default: 0 },
  outsideFood: { type: String, enum: ["no", "once", "twice", "more"], default: "no" },
  waterIntake: { type: Number, default: 0 }, // glasses
  exerciseLevel: { type: String, enum: ["no", "light", "moderate", "intense"], default: "no" },
  steps: { type: Number, default: 0 },
  activityScore: { type: Number, default: 0 },
}, { _id: true });

const fitnessGoalSchema = new mongoose.Schema({
  title: { type: String, required: true },
  target: { type: Number, required: true },
  current: { type: Number, default: 0 },
  unit: { type: String, default: "times" },
  createdAt: { type: Date, default: Date.now },
}, { _id: true });

const fitnessSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  dailyAssessments: [dailyAssessmentSchema],
  goals: [fitnessGoalSchema],
  stepGoal: { type: Number, default: 7000 },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  totalWorkoutDays: { type: Number, default: 0 },
  lastWorkoutDate: { type: Date, default: null },
}, { timestamps: true });

export default mongoose.model("Fitness", fitnessSchema);
