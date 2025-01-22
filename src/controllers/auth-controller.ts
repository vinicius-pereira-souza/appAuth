import { Request, Response } from "express";
import {
  loginFormSchema,
  signupFormSchema,
  changePasswordSchema,
} from "../lib/validations";
import { hashSync, compareSync } from "bcrypt";
import { createSession, decrypt, getSession } from "../lib/session";
import { responseServerError } from "../utils";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function signup(req: Request, res: Response) {
  try {
    const { error, data } = signupFormSchema.safeParse(req.body);

    if (error) {
      return res.status(400).json({ error: error.flatten().fieldErrors });
    }

    const userExist = await prisma.user.findFirst({
      where: { OR: [{ email: data.email }, { name: data.username }] },
    });

    if (userExist) {
      return res
        .status(400)
        .json({ message: "the username or email already exists" });
    }

    const { username, email, password } = data;
    const passwordHash = hashSync(password, 10);

    const user = await prisma.user.create({
      data: { email, password: passwordHash, name: username },
    });

    if (!user) {
      return res
        .status(500)
        .json({ message: "An error has occurred, please try again later" });
    }

    await createSession(user.id, req);
    return res
      .status(201)
      .json({ message: "authentication successful, we will redirect you" });
  } catch (error) {
    responseServerError(error, res);
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { error, data } = loginFormSchema.safeParse(req.body);

    if (error) {
      return res.status(400).json({ error: error.flatten().fieldErrors });
    }

    const { email, password } = data;
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (!user) {
      return res.status(400).json({ message: "email not found" });
    }

    const passwordIsMatch = compareSync(password, user.password);
    if (!passwordIsMatch) {
      return res.status(400).json({ message: "incorrect password" });
    }

    await createSession(user.id, req);
    return res
      .status(201)
      .json({ message: "authentication successful, we will redirect you" });
  } catch (error) {
    responseServerError(error, res);
  }
}

export async function forgetPassword(req: Request, res: Response) {}

export async function getUserData(req: Request, res: Response) {
  try {
    const session = await getSession(req, res);
    const validatedToken = await decrypt(session);

    if (!validatedToken) {
      return res
        .status(403)
        .json({ message: "Invalid session. Please login again." });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: `${validatedToken.userId}`,
      },
      select: {
        name: true,
        email: true,
      },
    });

    if(!user) {
      return res.status(404).json({message: "user not found"})
    }

    return res.status(200).json(user);
  } catch (error) {
    responseServerError(error, res);
  }
}

export async function updateProfile(req: Request, res: Response) {}

export async function changePassword(req: Request, res: Response) {
  try {
    const { error, data } = changePasswordSchema.safeParse(req.body);

    if (error) {
      return res.status(400).json({ error: error.flatten().fieldErrors });
    }

    const session = await getSession(req, res);
    const validatedToken = await decrypt(session);

    if (!validatedToken) {
      return res
        .status(403)
        .json({ message: "Invalid session. Please login again." });
    }

    const user = await prisma.user.findUnique({
      where: { id: `${validatedToken.userId}` },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { oldPassword, newPassword } = data;

    if (!compareSync(oldPassword, user.password)) {
      return res.status(400).json({ message: "incorrect password" });
    }

    const newPasswordHash = hashSync(newPassword, 10);

    await prisma.user.update({
      where: { id: `${validatedToken.userId}` },
      data: { password: newPasswordHash },
    });

    return res.status(200).json({ message: "password updated successfully" });
  } catch (error) {
    responseServerError(error, res);
  }
}

export async function logout(req: Request, res: Response) {
  try {
    req.session.destroy((error) => {
      if (error) {
        console.error("error during session destruction", error);
        return res.status(500).json({ message: "Error during logout:" });
      }
    });
    return res
      .clearCookie("session")
      .status(200)
      .json({ message: "logout successful" });
  } catch (error) {
    responseServerError(error, res);
  }
}

export async function deleteAccount(req: Request, res: Response) {}
