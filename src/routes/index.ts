import { Router, Response } from "express";
import { signup, login, logout } from "../controllers/auth-controller";

// Middleware
import isAuthenticated from "../middleware/isAuthenticated";

const router = Router()
  .get("/test", (req, res: Response) => {
    return res.status(200).send("API is Working!");
  })
  .post("/signup", signup)
  .post("/login", login)
  .post("/logout", isAuthenticated, logout);

export default router;
