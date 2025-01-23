import { Request, Response } from "express";
import { JWTPayload, SignJWT, jwtVerify } from "jose";
import config from "config";

const secretKey = config.get<string>("secret_key");
const encodedKey = new TextEncoder().encode(secretKey);

declare module "express-session" {
  interface SessionData {
    user?: {
      session: string | undefined;
    };
  }
}

export async function encrypt(payload: JWTPayload | undefined) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

export async function decrypt(session = "") {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });

    return payload;
  } catch (error) {
    console.log("Failed to verify session", error);
  }
}

export async function createSession(userId: string, req: Request) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await encrypt({ userId, expiresAt });

  if (session) {
    req.session.user = { session };
  }
}

export async function getSession(req: Request, res: Response) {
  try {
    const sessionToken: string | undefined = req.session.user?.session;
    if (!sessionToken) {
      res.status(401).json({
        status: "error",
        type: "authValidation_error",
        error: {
          code: 401,
          details: "Session token not found. Please log in.",
        },
      });
    }

    return sessionToken;
  } catch (error) {
    console.log("Failed to verify session", error);
  }
}
