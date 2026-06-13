import fs from "fs/promises";
import MenuJob from "../models/MenuJob.js";
import Restaurant from "../models/Restaurant.js";
import { extractMenuItemsFromImage } from "./bedrockService.js";

const deleteImage = async (imagePath) => {
  if (!imagePath) return;

  try {
    await fs.unlink(imagePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error(`Failed to delete image ${imagePath}:`, error.message);
    }
  }
};

export const processMenuJob = async (jobId, imagePath) => {
  try {
    const job = await MenuJob.findByIdAndUpdate(
      jobId,
      { status: "processing", error: null },
      { new: true }
    );

    if (!job) {
      throw new Error("Job not found");
    }

    const items = await extractMenuItemsFromImage(imagePath);

    await Restaurant.findOneAndUpdate(
      { restaurant_name: job.restaurant_name },
      { restaurant_name: job.restaurant_name, items },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await MenuJob.findByIdAndUpdate(jobId, {
      status: "completed",
      error: null,
    });
  } catch (error) {
    await MenuJob.findByIdAndUpdate(jobId, {
      status: "failed",
      error: error.message || "Menu extraction failed",
    });
    console.error(`Menu job ${jobId} failed:`, error.message);
  } finally {
    await deleteImage(imagePath);
  }
};
