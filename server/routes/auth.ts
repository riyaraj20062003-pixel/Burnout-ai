import type { RequestHandler } from "express";
import type { AuthUser, LoginRequest, LoginResponse, TokenPayload } from "../../shared/api";
import { loginRequestSchema } from "../../shared/validators";
import { failure, success } from "../lib/http";
import { signAuthToken } from "../middleware/auth";

const MOCK_USERS: Record<"student" | "parent" | "mentor", AuthUser & { password: string }> = {
  student: {
    id: "user-student-demo",
    email: "student@example.com",
    role: "student",
    password: "password123",
  },
  parent: {
    id: "user-parent-demo",
    email: "parent@example.com",
    role: "parent",
    password: "password123",
  },
  mentor: {
    id: "user-mentor-demo",
    email: "mentor@example.com",
    role: "mentor",
    password: "password123",
  },
};

export const handleLogin: RequestHandler = (req, res) => {
  const parsed = loginRequestSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json(
      failure("VALIDATION_ERROR", "Invalid login credentials", {
        issues: parsed.error.issues,
      }),
    );
    return;
  }

  const body = parsed.data as LoginRequest;
  const mockUser = MOCK_USERS[body.role];
  const emailMatches = body.email.trim().toLowerCase() === mockUser.email.toLowerCase();
  const passwordMatches = body.password === mockUser.password;

  if (!emailMatches || !passwordMatches) {
    res
      .status(401)
      .json(
        failure(
          "AUTH_INVALID_CREDENTIALS",
          "Invalid credentials for selected role. Use the provided mock test account.",
        ),
      );
    return;
  }

  const user: AuthUser = {
    id: mockUser.id,
    email: mockUser.email,
    role: mockUser.role,
  };

  const tokenPayload: TokenPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };

  const response: LoginResponse = {
    token: signAuthToken(tokenPayload),
    user,
    expiresIn: 60 * 60 * 8,
  };

  res.status(200).json(success(response));
};
