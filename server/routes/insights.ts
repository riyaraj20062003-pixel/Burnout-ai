import type { RequestHandler } from "express";
import type {
  GenerateInsightsRequest,
  SmartInsightsResponse,
} from "../../shared/api";
import { generateInsightsRequestSchema } from "../../shared/validators";
import { failure, success } from "../lib/http";
import { getDeadlinesForUser } from "../lib/deadline-store";

export const handleGenerateInsights: RequestHandler = (req, res) => {
  if (!req.user) {
    res.status(401).json(failure("AUTH_REQUIRED", "Authentication required"));
    return;
  }

  const parsed = generateInsightsRequestSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json(
      failure("VALIDATION_ERROR", "Invalid insights payload", {
        issues: parsed.error.issues,
      }),
    );
    return;
  }

  const input = parsed.data as GenerateInsightsRequest;
  const deadlines = getDeadlinesForUser(req.user.sub);
  const missed = deadlines.filter((item) => item.status === "missed").length;
  const upcoming = deadlines.filter((item) => item.status === "upcoming").length;

  const insights: string[] = [];

  if (input.sleepHours < 6 && input.stressLevel >= 6) {
    insights.push("Low sleep is likely driving your current stress levels.");
  }

  if (input.screenTime > 8) {
    insights.push("Screen time is too high and may be amplifying burnout risk.");
  }

  if (input.burnoutScore >= 70) {
    insights.push("Burnout risk is high; prioritize immediate recovery actions today.");
  }

  if (missed > 0) {
    insights.push(`${missed} deadline${missed > 1 ? "s are" : " is"} already missed, increasing pressure.`);
  }

  if (upcoming >= 3) {
    insights.push("You have multiple upcoming deadlines; plan smaller focus blocks now.");
  }

  if (insights.length === 0) {
    insights.push("Your current patterns look stable. Keep sleep and workload balanced.");
  }

  const payload: SmartInsightsResponse = {
    primaryInsight: insights[0],
    insights,
  };

  res.status(200).json(success(payload));
};
