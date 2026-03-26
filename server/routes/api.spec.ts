import request from "supertest";
import { describe, expect, it } from "vitest";
import { createServer } from "../index";

describe("API contracts", () => {
  it("logs in with valid payload and returns token envelope", async () => {
    const app = createServer();

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "student@example.com",
        password: "password123",
        role: "student",
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(typeof response.body.data.token).toBe("string");
    expect(response.body.data.user.role).toBe("student");
  });

  it("rejects login when credentials do not match hardcoded mock account", async () => {
    const app = createServer();

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "student@example.com",
        password: "wrong-password",
        role: "student",
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("AUTH_INVALID_CREDENTIALS");
  });

  it("rejects burnout prediction without token", async () => {
    const app = createServer();

    const response = await request(app)
      .post("/api/burnout/predict")
      .send({});

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("AUTH_REQUIRED");
  });

  it("forbids non-student role on burnout endpoints", async () => {
    const app = createServer();

    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: "parent@example.com",
        password: "password123",
        role: "parent",
      });

    const token = loginResponse.body.data.token;

    const response = await request(app)
      .post("/api/burnout/predict")
      .set("Authorization", `Bearer ${token}`)
      .send({
        sleep_hours: 6,
        study_hours: 6,
        stress_level: 4,
        assignment_load: 5,
        mood: "Neutral",
        social_activity: 4,
        screen_time: 5,
        motivation_level: 5,
      });

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("AUTH_FORBIDDEN");
  });

  it("accepts student burnout prediction and returns typed response", async () => {
    const app = createServer();

    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: "student@example.com",
        password: "password123",
        role: "student",
      });

    const token = loginResponse.body.data.token;

    const response = await request(app)
      .post("/api/burnout/predict")
      .set("Authorization", `Bearer ${token}`)
      .send({
        sleep_hours: 6,
        study_hours: 6,
        stress_level: 4,
        assignment_load: 5,
        mood: "Neutral",
        social_activity: 4,
        screen_time: 5,
        motivation_level: 5,
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(typeof response.body.data.burnout_score).toBe("number");
    expect(["low", "moderate", "high"]).toContain(response.body.data.risk_level);
    expect(Array.isArray(response.body.data.recommendations)).toBe(true);
  });

  it("rejects invalid prediction payload with validation error", async () => {
    const app = createServer();

    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: "student@example.com",
        password: "password123",
        role: "student",
      });

    const token = loginResponse.body.data.token;

    const response = await request(app)
      .post("/api/burnout/predict")
      .set("Authorization", `Bearer ${token}`)
      .send({
        sleep_hours: -3,
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns chat response with topic suggestions for student", async () => {
    const app = createServer();

    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: "student@example.com",
        password: "password123",
        role: "student",
      });

    const token = loginResponse.body.data.token;

    const response = await request(app)
      .post("/api/chat/message")
      .set("Authorization", `Bearer ${token}`)
      .send({
        message: "I am stressed and not sleeping enough",
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.topic).toBe("stress");
    expect(Array.isArray(response.body.data.suggestions)).toBe(true);
  });

  it("returns support resource modules for student", async () => {
    const app = createServer();

    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: "student@example.com",
        password: "password123",
        role: "student",
      });

    const token = loginResponse.body.data.token;

    const response = await request(app)
      .get("/api/resources/support")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data.tools)).toBe(true);
    expect(response.body.data.tools.length).toBeGreaterThanOrEqual(4);
  });

  it("creates and lists deadlines with computed status", async () => {
    const app = createServer();

    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: "student@example.com",
        password: "password123",
        role: "student",
      });

    const token = loginResponse.body.data.token;

    const createResponse = await request(app)
      .post("/api/deadlines")
      .set("Authorization", `Bearer ${token}`)
      .send({
        subject: "Math Assignment",
        dueAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.success).toBe(true);
    expect(createResponse.body.data.status).toBe("upcoming");

    const listResponse = await request(app)
      .get("/api/deadlines")
      .set("Authorization", `Bearer ${token}`);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.success).toBe(true);
    expect(Array.isArray(listResponse.body.data.deadlines)).toBe(true);
    expect(listResponse.body.data.deadlines.length).toBeGreaterThanOrEqual(1);
  });

  it("returns smart insights with expected behavioral flags", async () => {
    const app = createServer();

    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: "student@example.com",
        password: "password123",
        role: "student",
      });

    const token = loginResponse.body.data.token;

    const response = await request(app)
      .post("/api/insights/generate")
      .set("Authorization", `Bearer ${token}`)
      .send({
        sleepHours: 4.5,
        stressLevel: 8,
        screenTime: 9,
        burnoutScore: 78,
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(typeof response.body.data.primaryInsight).toBe("string");
    expect(Array.isArray(response.body.data.insights)).toBe(true);
    expect(response.body.data.insights.join(" ").toLowerCase()).toContain("screen time");
  });

  it("returns real-time burnout trend points for student", async () => {
    const app = createServer();

    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: "student@example.com",
        password: "password123",
        role: "student",
      });

    const token = loginResponse.body.data.token;

    const response = await request(app)
      .get("/api/burnout/trends")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data.points)).toBe(true);
    expect(response.body.data.points.length).toBeGreaterThan(0);
    expect(typeof response.body.data.points[0].burnout).toBe("number");
  });

  it("returns parent workflow dashboard payload for matching role", async () => {
    const app = createServer();

    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: "parent@example.com",
        password: "password123",
        role: "parent",
      });

    const token = loginResponse.body.data.token;

    const response = await request(app)
      .get("/api/role-dashboard/parent")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.role).toBe("parent");
    expect(Array.isArray(response.body.data.students)).toBe(true);
  });

  it("blocks role dashboard access when token role mismatches route role", async () => {
    const app = createServer();

    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: "parent@example.com",
        password: "password123",
        role: "parent",
      });

    const token = loginResponse.body.data.token;

    const response = await request(app)
      .get("/api/role-dashboard/mentor")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("AUTH_FORBIDDEN");
  });
});
