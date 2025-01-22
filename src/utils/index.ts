import { Response } from "express";

export async function responseServerError(error: any, res: Response) {
  console.log("Error during registration: ", error);
  return res
    .status(500)
    .json({ message: "An error has occurred, please try again later" });
}
