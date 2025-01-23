import { Router, Response } from "express";
import {
  signup,
  login,
  logout,
  updateProfile,
  changePassword,
  forgetPassword,
  deleteAccount,
  getUserData,
} from "../controllers/auth-controller";

// Middleware
import isAuthenticated from "../middleware/isAuthenticated";

const router = Router()
  .get("/test", (req, res: Response) => {
    return res.status(200).send("API is Working!");
  })
  .post("/signup", signup)
  .post("/login", login)
  .put("/update-profile", isAuthenticated, updateProfile)
  .patch("/change-password", isAuthenticated, changePassword)
  .post("/forgot-password", forgetPassword)
  .post("/logout", isAuthenticated, logout)
  .post("/delete-account", isAuthenticated, deleteAccount)
  .get("/", isAuthenticated, getUserData);

export default router;
