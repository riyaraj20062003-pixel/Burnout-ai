import type {
  ApiFailure,
  ApiResponse,
  BurnoutHistoryPoint,
  BurnoutPredictRequest,
  BurnoutPredictResponse,
  BurnoutTrendPoint,
  BurnoutTrendsResponse,
  ChatMessage,
  ChatMessageRequest,
  ChatMessageResponse,
  CreateDeadlineRequest,
  DeadlineItem,
  DeadlinesResponse,
  GenerateInsightsRequest,
  LoginRequest,
  LoginResponse,
  ResourceSupportResponse,
  RoleDashboardResponse,
  SmartInsightsResponse,
} from "@shared/api";
import { getToken } from "./auth";

const JSON_HEADERS = {
  "Content-Type": "application/json",
};

class ApiClientError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number, code = "API_ERROR") {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
  }
}

function isApiFailure<T>(payload: ApiResponse<T>): payload is ApiFailure {
  return payload.success === false;
}

async function parseApiResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as ApiResponse<T>;

  if (isApiFailure(payload)) {
    throw new ApiClientError(
      payload.error.message,
      response.status,
      payload.error.code,
    );
  }

  if (!response.ok) {
    throw new ApiClientError("Request failed", response.status, "HTTP_ERROR");
  }

  return payload.data;
}

function buildAuthHeaders(): Record<string, string> {
  const token = getToken();
  if (!token) {
    return JSON_HEADERS;
  }

  return {
    ...JSON_HEADERS,
    Authorization: `Bearer ${token}`,
  };
}

export async function login(request: LoginRequest): Promise<LoginResponse> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(request),
  });

  return parseApiResponse<LoginResponse>(response);
}

export async function predictBurnout(
  request: BurnoutPredictRequest,
): Promise<BurnoutPredictResponse> {
  const response = await fetch("/api/burnout/predict", {
    method: "POST",
    headers: buildAuthHeaders(),
    body: JSON.stringify(request),
  });

  return parseApiResponse<BurnoutPredictResponse>(response);
}

export async function getBurnoutHistory(): Promise<BurnoutHistoryPoint[]> {
  const response = await fetch("/api/burnout/history", {
    method: "GET",
    headers: buildAuthHeaders(),
  });

  return parseApiResponse<BurnoutHistoryPoint[]>(response);
}

export async function getBurnoutTrends(): Promise<BurnoutTrendPoint[]> {
  const response = await fetch("/api/burnout/trends", {
    method: "GET",
    headers: buildAuthHeaders(),
  });

  const payload = await parseApiResponse<BurnoutTrendsResponse>(response);
  return payload.points;
}

export async function sendChatMessage(
  request: ChatMessageRequest,
): Promise<ChatMessageResponse> {
  const response = await fetch("/api/chat/message", {
    method: "POST",
    headers: buildAuthHeaders(),
    body: JSON.stringify(request),
  });

  return parseApiResponse<ChatMessageResponse>(response);
}

export async function getChatHistory(): Promise<ChatMessage[]> {
  const response = await fetch("/api/chat/history", {
    method: "GET",
    headers: buildAuthHeaders(),
  });

  return parseApiResponse<ChatMessage[]>(response);
}

export async function getSupportResources(params?: {
  riskLevel?: "low" | "moderate" | "high";
  mood?: string;
}): Promise<ResourceSupportResponse> {
  const query = new URLSearchParams();
  if (params?.riskLevel) {
    query.set("riskLevel", params.riskLevel);
  }
  if (params?.mood) {
    query.set("mood", params.mood);
  }

  const response = await fetch(`/api/resources/support${query.size ? `?${query.toString()}` : ""}`, {
    method: "GET",
    headers: buildAuthHeaders(),
  });

  return parseApiResponse<ResourceSupportResponse>(response);
}

export async function getDeadlines(): Promise<DeadlineItem[]> {
  const response = await fetch("/api/deadlines", {
    method: "GET",
    headers: buildAuthHeaders(),
  });

  const payload = await parseApiResponse<DeadlinesResponse>(response);
  return payload.deadlines;
}

export async function createDeadline(
  request: CreateDeadlineRequest,
): Promise<DeadlineItem> {
  const response = await fetch("/api/deadlines", {
    method: "POST",
    headers: buildAuthHeaders(),
    body: JSON.stringify(request),
  });

  return parseApiResponse<DeadlineItem>(response);
}

export async function deleteDeadline(deadlineId: string): Promise<void> {
  const response = await fetch(`/api/deadlines/${deadlineId}`, {
    method: "DELETE",
    headers: buildAuthHeaders(),
  });

  await parseApiResponse<{ deleted: boolean }>(response);
}

export async function generateSmartInsights(
  request: GenerateInsightsRequest,
): Promise<SmartInsightsResponse> {
  const response = await fetch("/api/insights/generate", {
    method: "POST",
    headers: buildAuthHeaders(),
    body: JSON.stringify(request),
  });

  return parseApiResponse<SmartInsightsResponse>(response);
}

export async function getRoleDashboard(
  role: "parent" | "mentor",
): Promise<RoleDashboardResponse> {
  const response = await fetch(`/api/role-dashboard/${role}`, {
    method: "GET",
    headers: buildAuthHeaders(),
  });

  return parseApiResponse<RoleDashboardResponse>(response);
}

export { ApiClientError };
