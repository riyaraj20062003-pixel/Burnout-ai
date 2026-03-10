import { RequestHandler } from "express";

interface PredictRequest {
  sleep_hours: number;
  study_hours: number;
  stress_level: number;
  assignment_load: number;
  mood: string;
  social_activity: number;
  screen_time: number;
  motivation_level: number;
}

export const handlePredict: RequestHandler = (req, res) => {
  const {
    sleep_hours,
    study_hours,
    stress_level,
    assignment_load,
    mood,
    social_activity,
    screen_time,
    motivation_level
  } = req.body as PredictRequest;

  // Simple logic to mimic a RandomForest (Weighted scoring system)
  // Higher sleep, social, motivation = lower burnout
  // Higher study, stress, load, screen = higher burnout
  
  let score = 0;
  
  // Weights (Total score out of 100)
  score += (10 - sleep_hours) * 4; // Max 40
  score += (study_hours / 2) * 5;  // Max 25 (if 10 hrs study)
  score += stress_level * 3.5;     // Max 35
  score += assignment_load * 2.5;  // Max 25
  score -= social_activity * 2;    // Social helps reduce
  score += screen_time * 1.5;      // Screen adds stress
  score -= motivation_level * 3;   // Motivation helps reduce
  
  // Normalize score between 0 and 100
  score = Math.max(5, Math.min(98, score));
  
  let level: "low" | "moderate" | "high" = "low";
  if (score > 75) level = "high";
  else if (score > 45) level = "moderate";

  // Simulate processing time
  setTimeout(() => {
    res.json({
      burnout_score: Math.round(score),
      risk_level: level,
      recommendations: getRecommendations(level, score),
      insights: getAIInsights(level, score, sleep_hours, stress_level)
    });
  }, 1000);
};

function getRecommendations(level: string, score: number) {
  if (score > 75) return [
    "Immediate mentor consultation required",
    "Mandatory digital detox for 48 hours",
    "Focus on restorative sleep (8+ hours)",
    "Consult campus wellness center"
  ];
  if (score > 45) return [
    "Schedule a break every 50 minutes",
    "Reduce non-academic screen time",
    "Try light physical activity like walking",
    "Journal your stress triggers"
  ];
  return [
    "Excellent balance maintained",
    "Consider sharing your time management tips",
    "Reward yourself with a fun social activity"
  ];
}

function getAIInsights(level: string, score: number, sleep: number, stress: number) {
  if (sleep < 5) return "Your critical sleep deficit is the primary driver of your high burnout score.";
  if (stress > 8) return "Extremely high stress levels detected without sufficient recovery periods.";
  return `Based on your patterns, you are managing well but should watch your ${stress > 5 ? 'stress' : 'study load'} trends.`;
}
