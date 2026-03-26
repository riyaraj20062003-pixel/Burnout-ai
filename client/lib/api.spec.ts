// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import type {
  ApiFailure,
  ApiSuccess,
  ChatMessageResponse,
  DeadlinesResponse,
  LoginResponse,
  ResourceSupportResponse,
  SmartInsightsResponse,
} from "@shared/api";
import {
  ApiClientError,
  generateSmartInsights,
  getBurnoutTrends,
  getDeadlines,
  getRoleDashboard,
  getSupportResources,
  login,
  sendChatMessage,
} from "./api";

describe("client api contracts", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns login payload when server response is successful", async () => {
    const data: LoginResponse = {
      token: "abc.def.ghi",
      user: {
        id: "u-1",
        email: "student@example.com",
        role: "student",
      },
      expiresIn: 28800,
    };

    const payload: ApiSuccess<LoginResponse> = {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => payload,
      }),
    );

    const result = await login({
      email: "student@example.com",
      password: "password123",
      role: "student",
    });

    expect(result.user.role).toBe("student");
    expect(result.token).toBe("abc.def.ghi");
  });

  it("throws ApiClientError when server returns typed API failure", async () => {
    const payload: ApiFailure = {
      success: false,
      error: {
        code: "AUTH_INVALID",
        message: "Token is invalid",
      },
      timestamp: new Date().toISOString(),
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => payload,
      }),
    );

    await expect(
      login({
        email: "student@example.com",
        password: "password123",
        role: "student",
      }),
    ).rejects.toBeInstanceOf(ApiClientError);
  });

  it("returns chatbot reply payload", async () => {
    const data: ChatMessageResponse = {
      reply: "Try a 3-minute breathing reset.",
      topic: "stress",
      suggestions: ["Start guided breathing now"],
    };

    const payload: ApiSuccess<ChatMessageResponse> = {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => payload,
      }),
    );

    const result = await sendChatMessage({
      message: "I feel stressed",
    });

    expect(result.topic).toBe("stress");
    expect(result.suggestions[0]).toContain("breathing");
  });

  it("returns support resources payload", async () => {
    const data: ResourceSupportResponse = {
      tools: [
        {
          id: "stress",
          title: "Breathing Reset",
          description: "",
          category: "stress",
          actionLabel: "Start",
          steps: ["Step 1"],
        },
      ],
      mentorContact: {
        name: "Mentor Support Desk",
        channel: "in-app",
        responseEtaMinutes: 10,
        availability: "Mon-Sat",
      },
    };

    const payload: ApiSuccess<ResourceSupportResponse> = {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => payload,
      }),
    );

    const result = await getSupportResources();
    expect(result.tools[0].category).toBe("stress");
    expect(result.mentorContact.channel).toBe("in-app");
  });

  it("returns deadline list payload", async () => {
    const data: DeadlinesResponse = {
      deadlines: [
        {
          id: "d-1",
          subject: "Physics Quiz",
          dueAt: new Date().toISOString(),
          status: "upcoming",
          createdAt: new Date().toISOString(),
        },
      ],
    };

    const payload: ApiSuccess<DeadlinesResponse> = {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => payload,
      }),
    );

    const result = await getDeadlines();
    expect(result[0].subject).toBe("Physics Quiz");
  });

  it("returns smart insights payload", async () => {
    const data: SmartInsightsResponse = {
      primaryInsight: "Low sleep is likely driving your current stress levels.",
      insights: [
        "Low sleep is likely driving your current stress levels.",
        "Screen time is too high and may be amplifying burnout risk.",
      ],
    };

    const payload: ApiSuccess<SmartInsightsResponse> = {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => payload,
      }),
    );

    const result = await generateSmartInsights({
      sleepHours: 5,
      stressLevel: 8,
      screenTime: 9,
      burnoutScore: 82,
    });

    expect(result.primaryInsight).toContain("sleep");
    expect(result.insights.length).toBeGreaterThanOrEqual(2);
  });

  it("returns burnout trends payload", async () => {
    const payload: ApiSuccess<{ points: Array<{ timestamp: string; label: string; burnout: number; stress: number; sleep: number }> }> = {
      success: true,
      data: {
        points: [
          {
            timestamp: new Date().toISOString(),
            label: "10:15",
            burnout: 52,
            stress: 6,
            sleep: 7.2,
          },
        ],
      },
      timestamp: new Date().toISOString(),
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => payload,
      }),
    );

    const result = await getBurnoutTrends();
    expect(result[0].burnout).toBe(52);
    expect(result[0].label).toBe("10:15");
  });

  it("returns role dashboard payload", async () => {
    const payload: ApiSuccess<{
      role: "parent";
      headline: string;
      summary: string;
      students: Array<{
        studentId: string;
        name: string;
        grade: string;
        riskLevel: "low" | "moderate" | "high";
        burnoutScore: number;
        stressLevel: number;
        sleepHours: number;
        upcomingDeadlineCount: number;
      }>;
      actions: Array<{
        id: string;
        title: string;
        description: string;
        priority: "high" | "medium" | "low";
        status: "pending" | "in_progress" | "done";
      }>;
      alerts: string[];
    }> = {
      success: true,
      data: {
        role: "parent",
        headline: "Child Wellness Overview",
        summary: "summary",
        students: [
          {
            studentId: "s1",
            name: "Ryan",
            grade: "Grade 10",
            riskLevel: "moderate",
            burnoutScore: 56,
            stressLevel: 7,
            sleepHours: 5.9,
            upcomingDeadlineCount: 2,
          },
        ],
        actions: [
          {
            id: "a1",
            title: "Action",
            description: "Description",
            priority: "high",
            status: "pending",
          },
        ],
        alerts: ["alert"],
      },
      timestamp: new Date().toISOString(),
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => payload,
      }),
    );

    const result = await getRoleDashboard("parent");
    expect(result.role).toBe("parent");
    expect(result.students.length).toBe(1);
  });
});
