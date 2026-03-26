import { z } from "zod";

export const userRoleSchema = z.enum(["student", "parent", "mentor"]);

export const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: userRoleSchema,
});

export const burnoutPredictRequestSchema = z.object({
  sleep_hours: z.number().min(0).max(24),
  study_hours: z.number().min(0).max(24),
  stress_level: z.number().min(0).max(10),
  assignment_load: z.number().min(0).max(10),
  mood: z.string().min(2).max(32),
  social_activity: z.number().min(0).max(10),
  screen_time: z.number().min(0).max(24),
  motivation_level: z.number().min(0).max(10),
});

export const chatMessageRequestSchema = z.object({
  message: z.string().min(2).max(600),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(600),
      }),
    )
    .max(12)
    .optional(),
});

export const resourceSupportQuerySchema = z.object({
  riskLevel: z.enum(["low", "moderate", "high"]).optional(),
  mood: z.string().min(2).max(32).optional(),
});

export const createDeadlineRequestSchema = z.object({
  subject: z.string().min(2).max(120),
  dueAt: z.string().datetime(),
});

export const generateInsightsRequestSchema = z.object({
  sleepHours: z.number().min(0).max(24),
  stressLevel: z.number().min(0).max(10),
  screenTime: z.number().min(0).max(24),
  burnoutScore: z.number().min(0).max(100),
});
