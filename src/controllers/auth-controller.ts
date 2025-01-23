import { Request, Response } from "express";
import {
  loginFormSchema,
  signupFormSchema,
  changePasswordSchema,
  updateProfileSchema,
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
      return res.status(400).json({
        status: "error",
        type: "signup_error",
        error: {
          code: 400,
          details: error.flatten().fieldErrors,
        },
      });
    }

    const userExist = await prisma.user.findFirst({
      where: { OR: [{ email: data.email }, { name: data.name }] },
    });

    if (userExist) {
      return res.status(400).json({
        status: "error",
        type: "signup_error",
        error: {
          code: 400,
          details: "the name or email already exists",
        },
      });
    }

    const { name, email, password } = data;
    const passwordHash = hashSync(password, 10);

    const user = await prisma.user.create({
      data: { email, password: passwordHash, name: name },
    });

    if (!user) {
      return res.status(500).json({
        status: "error",
        type: "signup_error",
        error: {
          code: 500,
          details: "An error has occurred, please try again later",
        },
      });
    }

    await createSession(user.id, req);
    return res.status(201).json({
      status: "success",
      type: "signup_success",
      data: {
        code: 201,
        user: { id: user.id, name: user.name, email: user.email },
        details: "authentication successful, we will redirect you",
      },
    });
  } catch (error) {
    responseServerError(error, res);
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { error, data } = loginFormSchema.safeParse(req.body);

    if (error) {
      return res.status(400).json({
        status: "error",
        type: "login_error",
        error: {
          code: 400,
          details: error.flatten().fieldErrors,
        },
      });
    }

    const { email, password } = data;
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      return res.status(404).json({
        status: "error",
        type: "login_error",
        error: { code: 404, details: "email not found" },
      });
    }

    const passwordIsMatch = compareSync(password, user.password);
    if (!passwordIsMatch) {
      return res.status(400).json({
        status: "error",
        type: "login_error",
        error: {
          code: 400,
          details: "incorrect password",
        },
      });
    }

    await createSession(user.id, req);
    return res.status(200).json({
      status: "success",
      type: "login_success",
      data: {
        code: 200,
        user: { id: user.id, name: user.name, email: user.email },
        details: "authentication successful, we will redirect you",
      },
    });
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
      return res.status(403).json({
        status: "error",
        type: "updateUserData_error",
        error: {
          code: 403,
          details: "Invalid session. Please login again.",
        },
      });
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

    if (!user) {
      return res.status(404).json({
        status: "error",
        type: "updateUserData_error",
        error: { code: 404, details: "user not found" },
      });
    }

    return res.status(200).json({
      status: "success",
      type: "update_success",
      data: { code: 200, user },
    });
  } catch (error) {
    responseServerError(error, res);
  }
}

export async function updateProfile(req: Request, res: Response) {
  try {
    const session = await getSession(req, res);
    const validatedToken = await decrypt(session);

    if (!validatedToken) {
      return res.status(403).json({
        status: "error",
        type: "updateUserData_error",
        error: {
          code: 403,
          details: "Invalid session. Please login again.",
        },
      });
    }

    const { error, data } = updateProfileSchema.safeParse(req.body);

    if (error) {
      return res.status(403).json({
        status: "error",
        type: "updateProfile_error",
        error: {
          code: 400,
          details: error.flatten().fieldErrors,
        },
      });
    }

    const user = await prisma.user.update({
      where: { id: `${validatedToken.userId}` },
      data: { ...data },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      return res.status(422).json({
        status: "error",
        type: "updataProfile_error",
        error: {
          code: 422,
          details:
            "Unable to update profile information. Please try again later",
        },
      });
    }

    return res.status(200).json({
      status: "success",
      type: "updataProfile_success",
      data: {
        code: 200,
        user,
        details: "profile information updated successfully",
      },
    });
  } catch (error) {
    responseServerError(error, res);
  }
}

export async function changePassword(req: Request, res: Response) {
  try {
    const { error, data } = changePasswordSchema.safeParse(req.body);

    if (error) {
      return res.status(400).json({
        status: "error",
        type: "changePassword_error",
        error: {
          code: 400,
          details: error.flatten().fieldErrors,
        },
      });
    }

    const session = await getSession(req, res);
    const validatedToken = await decrypt(session);

    if (!validatedToken) {
      return res.status(403).json({
        status: "error",
        type: "changePassword_error",
        error: {
          code: 403,
          details: "Invalid session. Please login again.",
        },
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: `${validatedToken.userId}` },
    });

    if (!user) {
      return res.status(404).json({
        status: "error",
        type: "changePassword_error",
        error: { code: 404, details: "email not found" },
      });
    }

    const { oldPassword, newPassword } = data;

    if (!compareSync(oldPassword, user.password)) {
      return res.status(400).json({
        status: "error",
        type: "changePassword_error",
        error: { code: 400, details: "incorrect password" },
      });
    }

    const newPasswordHash = hashSync(newPassword, 10);

    await prisma.user.update({
      where: { id: `${validatedToken.userId}` },
      data: { password: newPasswordHash },
    });

    return res.status(200).json({
      status: "success",
      type: "changePassword_error",
      data: { code: 200, details: "password updated successfully" },
    });
  } catch (error) {
    responseServerError(error, res);
  }
}

export async function logout(req: Request, res: Response) {
  try {
    req.session.destroy((error) => {
      if (error) {
        console.error("error during session destruction", error);
        return res.status(500).json({
          status: "error",
          type: "logup_error",
          error: { code: 500, details: "Error during logout" },
        });
      }
    });
    return res
      .clearCookie("session")
      .status(200)
      .json({
        status: "success",
        type: "logout_success",
        data: { code: 200, details: "logout successful" },
      });
  } catch (error) {
    responseServerError(error, res);
  }
}

export async function deleteAccount(req: Request, res: Response) {
  try {
    const session = await getSession(req, res);
    const validatedToken = await decrypt(session);

    if (!validatedToken) {
      return res.status(403).json({
        status: "error",
        type: "deleteAccount_error",
        error: {
          code: 403,
          details: "Invalid session. Please login again.",
        },
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: `${validatedToken.userId}` },
    });

    if (!user) {
      return res.status(404).json({
        status: "error",
        type: "deleteAccount_error",
        error: { code: 404, details: "User not found" },
      });
    }

    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        status: "error",
        type: "deleteAccount_error",
        error: { code: 400, details: "Password is required" },
      });
    }

    if (!compareSync(password, user.password)) {
      return res.status(400).json({
        status: "error",
        type: "deleteAccount_error",
        error: { code: 400, details: "Incorrect password" },
      });
    }

    await prisma.user.delete({ where: { id: `${validatedToken.userId}` } });

    req.session.destroy((error) => {
      if (error) {
        console.error("Error during session destruction", error);
        return res.status(500).json({
          status: "error",
          type: "deleteAccount_error",
          error: { code: 500, details: "Error during logout" },
        });
      }
    });

    res.clearCookie("session");

    return res.status(200).json({
      status: "success",
      type: "deleteAccount_success",
      data: {
        code: 200,
        details: "Your account has been deleted successfully",
      },
    });
  } catch (error) {
    console.error("Unexpected error in deleteAccount:", error);
    return responseServerError(error, res);
  }
}
