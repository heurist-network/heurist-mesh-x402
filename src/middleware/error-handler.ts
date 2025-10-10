// Simple error handler - catch and log errors

import type { Request, Response, NextFunction } from "express";
import logger from "../utils/logger.js";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error("Request error:", {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Don't send response if already sent
  if (res.headersSent) {
    return next(err);
  }

  // Return error response
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
}
