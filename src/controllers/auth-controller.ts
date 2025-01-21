import { Request, Response } from "express";
import { signupFormSchema } from "../lib/validations";
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
    const test = await prisma.user.findMany();
    console.log(test);
  } catch (error) {
    console.log("ocorreu um erro: ", error);
  }
}

export async function logout(req: Request, res: Response) {}
