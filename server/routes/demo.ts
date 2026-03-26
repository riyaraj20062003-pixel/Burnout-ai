import { RequestHandler } from "express";
import { DemoResponse } from "../../shared/api";
import { success } from "../lib/http";

export const handleDemo: RequestHandler = (req, res) => {
  const response: DemoResponse = {
    message: "Hello from Express server",
  };
  res.status(200).json(success(response));
};
