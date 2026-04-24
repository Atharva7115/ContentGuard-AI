import express from "express";
import multer from "multer";
import { Storage } from "@google-cloud/storage";
import path from "path";
import fs from "fs";

const router = express.Router();

// ===============================
// 🔹 1. Multer Setup (Temp Storage)
// ===============================
const upload = multer({ dest: "uploads/" });

// ===============================
// 🔹 2. Google Cloud Storage Setup
// ===============================
const storage = new Storage({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS, // path to service account key
});

const bucketName = process.env.GCLOUD_BUCKET;
const bucket = storage.bucket(bucketName);

// ===============================
// 🔹 3. Upload Route
// ===============================
router.post("/", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Create unique filename
    const blobName = `${Date.now()}-${file.originalname}`;
    const blob = bucket.file(blobName);

    // Upload file to GCS
    const blobStream = blob.createWriteStream({
      resumable: false,
    });

    blobStream.on("error", (err) => {
      console.error(err);
      res.status(500).json({ error: "Upload failed" });
    });

    blobStream.on("finish", async () => {
      // Make file public
      await blob.makePublic();

      const publicUrl = `https://storage.googleapis.com/${bucketName}/${blobName}`;

      // Delete temp file
      fs.unlinkSync(file.path);

      res.json({
        message: "File uploaded successfully",
        url: publicUrl,
      });
    });

    // Read temp file and pipe to GCS
    fs.createReadStream(file.path).pipe(blobStream);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;