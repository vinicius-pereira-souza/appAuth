import z from "zod";

export const usernameSchema = z
  .string({ required_error: "the Username field is required" })
  .min(4, { message: "Must be at least 4 characters long." })
  .regex(/^[^-_<>\"']+$/, {
    message: "Cannot contain special characters (<, >, ', ).",
  })
  .trim();

export const emailSchema = z
  .string({ required_error: "the Email field is required" })
  .email({ message: "Please enter a valid email." })
  .trim();

export const passwordSchema = z
  .string({ required_error: "the Password field is required" })
  .min(5, { message: "Be at least 5 characters long" })
  .regex(/[a-zA-Z]/, { message: "Contain at least one letter." })
  .regex(/[0-9]/, { message: "Contain at least one number." })
  .regex(/[^a-zA-Z0-9]/, {
    message: "Contain at least one special character.",
  })
  .trim();
