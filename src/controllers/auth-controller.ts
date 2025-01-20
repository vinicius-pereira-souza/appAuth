import { Request, Response } from "express";
import { signupFormSchema } from "../lib/validations";
import { hashSync, compareSync } from "bcrypt";
import { createSession } from "../lib/session";

export async function signup(req: Request, res: Response) {}

export async function login(req: Request, res: Response) {}

export async function logout(req: Request, res: Response) {}
