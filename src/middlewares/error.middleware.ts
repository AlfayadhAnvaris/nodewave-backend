import type { Context } from "hono"
import { ZodError } from "zod"
import { HTTPException } from "../errors/http.error"

export function errorHandler(err: Error, c: Context) {
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.statusCode as 400 | 401 | 403 | 404 | 409 | 500)
  }

  if (err instanceof ZodError) {
    return c.json(
      {
        error: "Validation failed",
        details: err.errors.map((e) => ({ path: e.path.join("."), message: e.message })),
      },
      422,
    )
  }

  return c.json({ error: "Internal Server Error" }, 500)
}
