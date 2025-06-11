import express from "express";
import { storage } from "../server/storage";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "unknown",
    hasDatabase: !!process.env.DATABASE_URL,
    hasSession: !!process.env.SESSION_SECRET,
    version: "1.0.0"
  });
});

// Basic API endpoints
app.get("/api/user/:id", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

app.get("/api/envelopes/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const envelopes = await storage.getEnvelopesByUserId(userId);
    res.json(envelopes);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch envelopes" });
  }
});

export default app;