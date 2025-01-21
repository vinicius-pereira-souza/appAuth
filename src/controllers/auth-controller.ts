import { Request, Response } from "express";
import { loginFormSchema, signupFormSchema } from "../lib/validations";
import { hashSync, compareSync } from "bcrypt";
import { createSession } from "../lib/session";
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
    console.log("Error during registration: ", error);
    return res
      .status(500)
      .json({ message: "An error has occurred, please try again later" });
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
    console.log("Error during registration: ", error);
    return res
      .status(500)
      .json({ message: "An error has occurred, please try again later" });
  }
}

export async function logout(req: Request, res: Response) {
  // req.session.destroy((error) => {
  //   if (error) {
  //     console.error("error during session destruction", error);
  //     return res.status(500).json({ message: "Error during logout:" });
  //   }
  // });
  // return res
  //   .clearCookie("connect.sid")
  //   .status(200)
  //   .json({ message: "An error has occurred, please try again later" });
  return res.status(200).send("logout");
}
