import { Request, Response, NextFunction } from "express";
import { decrypt } from "../lib/session";

export default async function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // step 1: pegar o cookie da sessão
  // step 2: validar o token do cookie da sessão
  // step 3: pegar o token da sessão
  // step 4: validar o token da sessão
  // step 5: avançar
}
