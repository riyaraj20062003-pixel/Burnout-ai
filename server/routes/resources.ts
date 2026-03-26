import type { RequestHandler } from "express";
import type { BurnoutRiskLevel, ResourceSupportResponse, ResourceTool } from "../../shared/api";
import { resourceSupportQuerySchema } from "../../shared/validators";
import { success } from "../lib/http";

function buildStressTool(riskLevel?: BurnoutRiskLevel): ResourceTool {
  const durationMinutes = riskLevel === "high" ? 5 : 3;

  return {
    id: "stress-breathing-reset",
    title: "Breathing Reset",
    description: "Lower stress quickly with paced breathing cycles.",
    category: "stress",
    actionLabel: "Start Breathing Tool",
    durationMinutes,
    steps: [
      "Inhale through nose for 4 seconds.",
      "Hold breath for 4 seconds.",
      "Exhale slowly for 6 seconds.",
      `Repeat for ${durationMinutes} minutes while keeping shoulders relaxed.`,
    ],
  };
}

function buildSleepTool(): ResourceTool {
  return {
    id: "sleep-winddown-plan",
    title: "Sleep Recovery Plan",
    description: "Improve sleep quality with an evening routine.",
    category: "sleep",
    actionLabel: "View Sleep Plan",
    durationMinutes: 30,
    steps: [
      "Stop caffeine at least 8 hours before bedtime.",
      "Set a 30-minute no-screen wind-down before sleep.",
      "Keep bedroom cool, dark, and quiet.",
      "Use the same wake-up time for the next 7 days.",
    ],
  };
}

function buildStudyTool(): ResourceTool {
  return {
    id: "study-pomodoro",
    title: "Pomodoro Focus Timer",
    description: "Use structured focus blocks to avoid cognitive overload.",
    category: "study",
    actionLabel: "Start Pomodoro",
    durationMinutes: 25,
    steps: [
      "Choose one single task.",
      "Focus for 25 minutes with no app switching.",
      "Take a 5-minute movement break.",
      "After 4 rounds, take a 20-minute reset break.",
    ],
  };
}

function buildMentalSupportTool(): ResourceTool {
  return {
    id: "mental-support-mentor",
    title: "Contact Mentor",
    description: "Reach out early when emotional load starts rising.",
    category: "mental_support",
    actionLabel: "Contact Mentor",
    steps: [
      "Share how you feel in one short message.",
      "Mention one immediate stress trigger.",
      "Ask for one concrete next-step recommendation.",
    ],
  };
}

export const handleResourceSupport: RequestHandler = (req, res) => {
  const parsed = resourceSupportQuerySchema.safeParse(req.query);
  const riskLevel = parsed.success ? parsed.data.riskLevel : undefined;

  const payload: ResourceSupportResponse = {
    tools: [buildStressTool(riskLevel), buildSleepTool(), buildStudyTool(), buildMentalSupportTool()],
    mentorContact: {
      name: "Mentor Support Desk",
      channel: "in-app",
      responseEtaMinutes: riskLevel === "high" ? 5 : 20,
      availability: "Mon-Sat, 8:00 AM - 8:00 PM",
    },
  };

  res.status(200).json(success(payload));
};
