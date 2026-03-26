import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { failure } from "../lib/http";

export const notFoundHandler: ErrorRequestHandler = (_err, _req, res, _next) => {
  res.status(404).json(failure("NOT_FOUND", "Resource not found"));
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json(
      failure("VALIDATION_ERROR", "Invalid request payload", {
        issues: err.issues,
      }),
    );
    return;
  }

  res.status(500).json(
    failure("INTERNAL_ERROR", "Unexpected server error", {
      message: err instanceof Error ? err.message : "Unknown error",
    }),
  );
};
