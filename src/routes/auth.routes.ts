import { Hono } from "hono"
import { authController } from "../controllers/auth.controller"
import { authMiddleware } from "../middlewares/auth.middleware"

export const authRoutes = new Hono()

authRoutes.post("/register", (c) => authController.register(c))
authRoutes.post("/login", (c) => authController.login(c))
authRoutes.post("/logout", (c) => authController.logout(c))
authRoutes.get("/me", authMiddleware, (c) => authController.me(c))
