import type { Context, Next } from "hono"
import { HTTPException } from "../errors/http.error"
import type { JWTPayload } from "../types/auth.types"
import { verifyJWTToken } from "../utils/jwt"

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new HTTPException(401, "Authentication token required")
  }

  const token = authHeader.substring(7)
  try {
    const payload = await verifyJWTToken(token)
    c.set("user", payload)
    await next()
  } catch (_err) {
    throw new HTTPException(401, "Invalid or expired token")
  }
}

export function getCurrentUser(c: Context): JWTPayload {
  const user = c.get("user") as JWTPayload | undefined
  if (!user) {
    throw new HTTPException(401, "Unauthorized access")
  }
  return user
}
