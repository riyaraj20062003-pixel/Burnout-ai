import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import type { TokenPayload, UserRole } from "../../shared/api";
import { failure } from "../lib/http";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-me";

export function signAuthToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });
}

export const authenticate: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json(failure("AUTH_REQUIRED", "Missing Bearer token"));
    return;
  }

  const token = authHeader.slice("Bearer ".length).trim();

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json(failure("AUTH_INVALID", "Token is invalid or expired"));
  }
};

export function authorizeRoles(roles: UserRole[]): RequestHandler {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json(failure("AUTH_REQUIRED", "Authentication required"));
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json(failure("AUTH_FORBIDDEN", "Insufficient role permissions"));
      return;
    }

    next();
  };
}
