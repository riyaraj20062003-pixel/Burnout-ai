/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

export type UserRole = "student" | "parent" | "mentor";
export type BurnoutRiskLevel = "low" | "moderate" | "high";

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  timestamp: string;
}

export interface ApiFailure {
  success: false;
  error: ApiError;
  timestamp: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

export interface PingResponse {
  message: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
  role: UserRole;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
  expiresIn: number;
}

export interface BurnoutPredictRequest {
  sleep_hours: number;
  study_hours: number;
  stress_level: number;
  assignment_load: number;
  mood: string;
  social_activity: number;
  screen_time: number;
  motivation_level: number;
}

export interface BurnoutPredictResponse {
  burnout_score: number;
  risk_level: BurnoutRiskLevel;
  recommendations: string[];
  insights: string;
}

export interface BurnoutHistoryPoint {
  day: string;
  score: number;
}

export interface BurnoutTrendPoint {
  timestamp: string;
  label: string;
  burnout: number;
  stress: number;
  sleep: number;
}

export interface BurnoutTrendsResponse {
  points: BurnoutTrendPoint[];
}

export interface TokenPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export type ChatMessageRole = "user" | "assistant";
export type ChatTopic = "stress" | "sleep" | "study" | "general";

export interface ChatMessage {
  id: string;
  role: ChatMessageRole;
  content: string;
  topic: ChatTopic;
  createdAt: string;
}

export interface ChatMessageRequest {
  message: string;
  history?: Array<Pick<ChatMessage, "role" | "content">>;
}

export interface ChatMessageResponse {
  reply: string;
  topic: ChatTopic;
  suggestions: string[];
}

export interface ResourceTool {
  id: string;
  title: string;
  description: string;
  category: "stress" | "sleep" | "study" | "mental_support";
  actionLabel: string;
  durationMinutes?: number;
  steps: string[];
}

export interface MentorContact {
  name: string;
  channel: "in-app";
  responseEtaMinutes: number;
  availability: string;
}

export interface ResourceSupportResponse {
  tools: ResourceTool[];
  mentorContact: MentorContact;
}

export type DeadlineStatus = "upcoming" | "missed";

export interface DeadlineItem {
  id: string;
  subject: string;
  dueAt: string;
  status: DeadlineStatus;
  createdAt: string;
}

export interface CreateDeadlineRequest {
  subject: string;
  dueAt: string;
}

export interface DeadlinesResponse {
  deadlines: DeadlineItem[];
}

export interface GenerateInsightsRequest {
  sleepHours: number;
  stressLevel: number;
  screenTime: number;
  burnoutScore: number;
}

export interface SmartInsightsResponse {
  primaryInsight: string;
  insights: string[];
}

export interface RoleStudentSnapshot {
  studentId: string;
  name: string;
  grade: string;
  riskLevel: BurnoutRiskLevel;
  burnoutScore: number;
  stressLevel: number;
  sleepHours: number;
  upcomingDeadlineCount: number;
}

export interface RoleActionItem {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "in_progress" | "done";
}

export interface RoleDashboardResponse {
  role: "parent" | "mentor";
  headline: string;
  summary: string;
  students: RoleStudentSnapshot[];
  actions: RoleActionItem[];
  alerts: string[];
}
