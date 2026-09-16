import { sign, verify } from "hono/jwt"
import { config } from "../config"
import type { JWTPayload } from "../types/auth.types"

export async function generateToken(payload: Omit<JWTPayload, "exp">): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7
  return await sign({ ...payload, exp }, config.jwtSecret, "HS256")
}

export async function verifyJWTToken(token: string): Promise<JWTPayload> {
  const decoded = await verify(token, config.jwtSecret, "HS256")
  return decoded as unknown as JWTPayload
}
