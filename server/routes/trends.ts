import type { RequestHandler } from "express";
import type { BurnoutTrendsResponse } from "../../shared/api";
import { failure, success } from "../lib/http";
import { getTrendSeriesForUser } from "../lib/trend-store";

export const handleBurnoutTrends: RequestHandler = (req, res) => {
  if (!req.user) {
    res.status(401).json(failure("AUTH_REQUIRED", "Authentication required"));
    return;
  }

  const trends = getTrendSeriesForUser(req.user.sub);

  const payload: BurnoutTrendsResponse = {
    points: trends,
  };

  res.status(200).json(success(payload));
};
