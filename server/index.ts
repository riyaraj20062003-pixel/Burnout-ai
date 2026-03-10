import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handlePredict } from "./routes/burnout";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Auth routes
  app.post("/api/auth/login", (req, res) => {
    const { email, password, role } = req.body;
    // Simulate JWT
    res.json({
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      user: { id: 1, email, role }
    });
  });

  // Burnout routes
  app.post("/api/burnout/predict", handlePredict);
  app.get("/api/burnout/history", (req, res) => {
    res.json([
      { day: "Mon", score: 25 },
      { day: "Tue", score: 30 },
      { day: "Wed", score: 45 },
      { day: "Thu", score: 55 },
      { day: "Fri", score: 40 },
      { day: "Sat", score: 35 },
      { day: "Sun", score: 20 },
    ]);
  });

  return app;
}
