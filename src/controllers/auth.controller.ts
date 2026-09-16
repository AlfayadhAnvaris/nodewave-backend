import type { Context } from "hono"
import { getCurrentUser } from "../middlewares/auth.middleware"
import { loginSchema, registerSchema } from "../schemas/auth.schema"
import { authService } from "../services/auth.service"

export class AuthController {
  async register(c: Context) {
    const body = await c.req.json()
    const parsed = registerSchema.parse(body)
    const result = await authService.register(parsed)
    return c.json(result, 201)
  }

  async login(c: Context) {
    const body = await c.req.json()
    const parsed = loginSchema.parse(body)
    const result = await authService.login(parsed)
    return c.json(result, 200)
  }

  async logout(c: Context) {
    return c.json({ message: "Successfully logged out" }, 200)
  }

  async me(c: Context) {
    const currentUser = getCurrentUser(c)
    const result = await authService.getMe(currentUser.userId)
    return c.json(result, 200)
  }

  async getCompanyUsers(c: Context) {
    const currentUser = getCurrentUser(c)
    const result = await authService.getCompanyUsers(currentUser.companyId)
    return c.json(result, 200)
  }
}

export const authController = new AuthController()
