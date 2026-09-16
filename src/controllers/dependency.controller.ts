import type { Context } from "hono"
import { HTTPException } from "../errors/http.error"
import { getCurrentUser } from "../middlewares/auth.middleware"
import { addDependencySchema } from "../schemas/dependency.schema"
import { dependencyService } from "../services/dependency.service"

export class DependencyController {
  async getDependencies(c: Context) {
    const currentUser = getCurrentUser(c)
    const id = c.req.param("id")
    if (!id) throw new HTTPException(400, "Missing task ID")
    const result = await dependencyService.getDependencies(id, currentUser)
    return c.json(result, 200)
  }

  async addDependency(c: Context) {
    const currentUser = getCurrentUser(c)
    const id = c.req.param("id")
    if (!id) throw new HTTPException(400, "Missing task ID")
    const body = await c.req.json()
    const parsed = addDependencySchema.parse(body)
    const result = await dependencyService.addDependency(id, parsed.dependsOnTaskId, currentUser)
    return c.json(result, 201)
  }

  async removeDependency(c: Context) {
    const currentUser = getCurrentUser(c)
    const id = c.req.param("id")
    const dependencyId = c.req.param("dependencyId")
    if (!id || !dependencyId) throw new HTTPException(400, "Missing parameters")
    await dependencyService.removeDependency(id, dependencyId, currentUser)
    return c.json({ message: "Dependency removed successfully" }, 200)
  }
}

export const dependencyController = new DependencyController()
