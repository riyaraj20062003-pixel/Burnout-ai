import type { RequestHandler } from "express";
import type { CreateDeadlineRequest, DeadlineItem, DeadlinesResponse } from "../../shared/api";
import { createDeadlineRequestSchema } from "../../shared/validators";
import { failure, success } from "../lib/http";
import {
  addDeadlineForUser,
  getDeadlinesForUser,
  removeDeadlineForUser,
} from "../lib/deadline-store";

export const handleGetDeadlines: RequestHandler = (req, res) => {
  if (!req.user) {
    res.status(401).json(failure("AUTH_REQUIRED", "Authentication required"));
    return;
  }

  const deadlines = getDeadlinesForUser(req.user.sub);
  const payload: DeadlinesResponse = {
    deadlines,
  };

  res.status(200).json(success(payload));
};

export const handleCreateDeadline: RequestHandler = (req, res) => {
  if (!req.user) {
    res.status(401).json(failure("AUTH_REQUIRED", "Authentication required"));
    return;
  }

  const parsed = createDeadlineRequestSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json(
      failure("VALIDATION_ERROR", "Invalid deadline payload", {
        issues: parsed.error.issues,
      }),
    );
    return;
  }

  const payload = parsed.data as CreateDeadlineRequest;
  const created: DeadlineItem = addDeadlineForUser(req.user.sub, payload);

  res.status(201).json(success(created));
};

export const handleDeleteDeadline: RequestHandler = (req, res) => {
  if (!req.user) {
    res.status(401).json(failure("AUTH_REQUIRED", "Authentication required"));
    return;
  }

  const rawDeadlineId = req.params.id;
  const deadlineId = Array.isArray(rawDeadlineId)
    ? rawDeadlineId[0]
    : rawDeadlineId;
  if (!deadlineId) {
    res.status(400).json(failure("VALIDATION_ERROR", "Missing deadline id"));
    return;
  }

  const removed = removeDeadlineForUser(req.user.sub, deadlineId);

  if (!removed) {
    res.status(404).json(failure("NOT_FOUND", "Deadline not found"));
    return;
  }

  res.status(200).json(success({ deleted: true }));
};
