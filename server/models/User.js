import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    dateOfBirth: { type: Date, default: null },
    college: { type: String, default: "" },
    course: { type: String, default: "" },
    semester: { type: Number, default: null },
    wellnessProfile: {
      semester: { type: Number, default: null },
      examDate: { type: Date, default: null },
      sleepHours: { type: Number, default: 6 },
      stressEatingPattern: { type: [String], default: ["Eat less/skip meals"] },
      cravingType: { type: [String], default: [] },
      stressLevel: { type: Number, default: 3 },
      studyHours: { type: Number, default: 6 },
      hasJob: { type: Boolean, default: false },
      surveyCompleted: { type: Boolean, default: false },
      lastResolvedBurnout: { type: Date, default: null },
      dailyCheckins: [
        {
          date: { type: Date, default: Date.now },
          sleepHours: { type: Number, required: true },
          eatingPattern: { type: String, enum: ["Healthy", "Ate out", "Skipped meals", "Binged"], required: true },
          stressLevel: { type: Number, min: 1, max: 5, required: true }
        }
      ]
    }
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model("User", userSchema);
