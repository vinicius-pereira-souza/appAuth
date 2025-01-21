import z from "zod";
import { usernameSchema, emailSchema, passwordSchema } from "./fields-schema";

export const signupFormSchema = z
  .object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmpassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmpassword, {
    path: ["confirmpassword"],
    message: "Password confirmation must be the same as the password.",
  });

export const loginFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const changePasswordSchema = z
  .object({
    oldPassword: passwordSchema,
    newPassword: passwordSchema,
    confirmNewPassword: passwordSchema,
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    path: ["confirmNewPassword"],
    message: "Password confirmation must be the same as the password.",
  });
