import "dotenv/config";
import express from "express";
import cors from "cors";
import type { BurnoutHistoryPoint, PingResponse } from "../shared/api";
import { handleDemo } from "./routes/demo";
import { handlePredict } from "./routes/burnout";
import { handleBurnoutTrends } from "./routes/trends";
import { handleRoleDashboard } from "./routes/role-dashboard";
import { handleLogin } from "./routes/auth";
import { handleChatHistory, handleChatMessage } from "./routes/chat";
import { handleResourceSupport } from "./routes/resources";
import {
  handleCreateDeadline,
  handleDeleteDeadline,
  handleGetDeadlines,
} from "./routes/deadlines";
import { handleGenerateInsights } from "./routes/insights";
import { authenticate, authorizeRoles } from "./middleware/auth";
import { errorHandler } from "./middleware/error-handler";
import { failure, success } from "./lib/http";
import { getTrendSeriesForUser } from "./lib/trend-store";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    const response: PingResponse = { message: ping };
    res.status(200).json(success(response));
  });

  app.get("/api/demo", handleDemo);

  // Auth routes
  app.post("/api/auth/login", handleLogin);

  // Burnout routes
  app.post("/api/burnout/predict", authenticate, authorizeRoles(["student"]), handlePredict);
  app.get("/api/burnout/history", authenticate, authorizeRoles(["student"]), (req, res) => {
    const userId = req.user?.sub ?? "anonymous-student";
    const trends = getTrendSeriesForUser(userId);

    const history: BurnoutHistoryPoint[] = trends.map((point) => ({
      day: point.label,
      score: point.burnout,
    }));

    res.status(200).json(success(history));
  });
  app.get("/api/burnout/trends", authenticate, authorizeRoles(["student"]), handleBurnoutTrends);

  // Chat + support routes
  app.post("/api/chat/message", authenticate, authorizeRoles(["student"]), handleChatMessage);
  app.get("/api/chat/history", authenticate, authorizeRoles(["student"]), handleChatHistory);
  app.get("/api/resources/support", authenticate, authorizeRoles(["student"]), handleResourceSupport);
  app.get("/api/role-dashboard/:role", authenticate, authorizeRoles(["parent", "mentor"]), handleRoleDashboard);
  app.get("/api/deadlines", authenticate, authorizeRoles(["student"]), handleGetDeadlines);
  app.post("/api/deadlines", authenticate, authorizeRoles(["student"]), handleCreateDeadline);
  app.delete("/api/deadlines/:id", authenticate, authorizeRoles(["student"]), handleDeleteDeadline);
  app.post("/api/insights/generate", authenticate, authorizeRoles(["student"]), handleGenerateInsights);

  app.use("/api", (_req, res) => {
    res.status(404).json(failure("API_NOT_FOUND", "API endpoint not found"));
  });

  app.use(errorHandler);

  return app;
}
