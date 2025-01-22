import { Request, Response, NextFunction } from "express";
import { decrypt, getSession } from "../lib/session";
import { responseServerError } from "../utils";

export default async function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const cookie = req.cookies.session;
    if (!cookie) {
      return res
        .status(401)
        .json({ message: "Cookie not found. Please log in." });
    }

    const session = await getSession(req, res);

    const validateSessionToken = await decrypt(session);

    if (!validateSessionToken) {
      return res
        .status(403)
        .json({ message: "Invalid session token. Please log in again." });
    }

    next();
  } catch (error) {
    responseServerError(error, res);
  }
}
