import type { RequestHandler } from "express";
import type {
  RoleActionItem,
  RoleDashboardResponse,
  RoleStudentSnapshot,
  UserRole,
} from "../../shared/api";
import { failure, success } from "../lib/http";

function buildStudentSnapshots(role: "parent" | "mentor"): RoleStudentSnapshot[] {
  if (role === "parent") {
    return [
      {
        studentId: "student-ryan",
        name: "Ryan A.",
        grade: "Grade 10",
        riskLevel: "moderate",
        burnoutScore: 58,
        stressLevel: 7,
        sleepHours: 5.8,
        upcomingDeadlineCount: 3,
      },
    ];
  }

  return [
    {
      studentId: "student-maya",
      name: "Maya P.",
      grade: "Grade 11",
      riskLevel: "high",
      burnoutScore: 82,
      stressLevel: 9,
      sleepHours: 4.9,
      upcomingDeadlineCount: 4,
    },
    {
      studentId: "student-kian",
      name: "Kian R.",
      grade: "Grade 9",
      riskLevel: "moderate",
      burnoutScore: 49,
      stressLevel: 6,
      sleepHours: 6.4,
      upcomingDeadlineCount: 2,
    },
    {
      studentId: "student-lina",
      name: "Lina S.",
      grade: "Grade 12",
      riskLevel: "low",
      burnoutScore: 27,
      stressLevel: 3,
      sleepHours: 7.5,
      upcomingDeadlineCount: 1,
    },
  ];
}

function buildActionItems(role: "parent" | "mentor"): RoleActionItem[] {
  if (role === "parent") {
    return [
      {
        id: "parent-action-1",
        title: "Schedule a bedtime reset",
        description: "Set a 30-minute no-screen wind-down with your child tonight.",
        priority: "high",
        status: "pending",
      },
      {
        id: "parent-action-2",
        title: "Review this week deadlines",
        description: "Plan 2 focus blocks around upcoming school tasks.",
        priority: "medium",
        status: "in_progress",
      },
      {
        id: "parent-action-3",
        title: "Send encouragement check-in",
        description: "Ask one open question about stress without discussing grades first.",
        priority: "low",
        status: "pending",
      },
    ];
  }

  return [
    {
      id: "mentor-action-1",
      title: "Immediate outreach to Maya",
      description: "High risk detected; schedule intervention call in the next 30 minutes.",
      priority: "high",
      status: "pending",
    },
    {
      id: "mentor-action-2",
      title: "Group resilience session",
      description: "Run a short coping strategy workshop for moderate-risk students.",
      priority: "medium",
      status: "in_progress",
    },
    {
      id: "mentor-action-3",
      title: "Update mentor notes",
      description: "Log stress triggers and sleep trends after each student check-in.",
      priority: "low",
      status: "pending",
    },
  ];
}

export const handleRoleDashboard: RequestHandler = (req, res) => {
  if (!req.user) {
    res.status(401).json(failure("AUTH_REQUIRED", "Authentication required"));
    return;
  }

  const routeRole = req.params.role;
  if (routeRole !== "parent" && routeRole !== "mentor") {
    res.status(400).json(failure("VALIDATION_ERROR", "Role must be parent or mentor"));
    return;
  }

  const userRole: UserRole = req.user.role;
  if (userRole !== routeRole) {
    res.status(403).json(failure("AUTH_FORBIDDEN", "Role mismatch for dashboard access"));
    return;
  }

  const role = routeRole;
  const students = buildStudentSnapshots(role);
  const actions = buildActionItems(role);

  const payload: RoleDashboardResponse = {
    role,
    headline: role === "parent" ? "Child Wellness Overview" : "Mentor Intervention Center",
    summary:
      role === "parent"
        ? "Monitor your child stress and sleep trends with actionable family support steps."
        : "Track student risk levels, prioritize intervention actions, and coordinate follow-ups.",
    students,
    actions,
    alerts:
      role === "parent"
        ? [
            "Sleep dropped below 6 hours for 2 nights.",
            "Assignment pressure is increasing this week.",
          ]
        : [
            "1 student in high-risk zone requires immediate contact.",
            "2 students have rising stress despite stable workload.",
          ],
  };

  res.status(200).json(success(payload));
};
