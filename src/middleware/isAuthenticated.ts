import { Request, Response, NextFunction } from "express";
import { decrypt } from "../lib/session";

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

    const sessionToken: string | undefined = req.session.user?.session;
    if (!sessionToken) {
      return res
        .status(401)
        .json({ message: "Session token not found. Please log in." });
    }

    const validateSessionToken = await decrypt(sessionToken);

    if (!validateSessionToken) {
      return res
        .status(403)
        .json({ message: "Invalid session token. Please log in again." });
    }

    next();
  } catch (error) {
    console.error("Error during authentication: ", error);
    return res.status(500).json({
      message: "An unexpected error occurred. Please try again later.",
    });
  }
}
