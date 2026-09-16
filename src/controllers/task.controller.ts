import type { Context } from "hono"
import { HTTPException } from "../errors/http.error"
import { getCurrentUser } from "../middlewares/auth.middleware"
import { createTaskSchema, taskQuerySchema, updateTaskSchema } from "../schemas/task.schema"
import { taskService } from "../services/task.service"

export class TaskController {
  async getTasksByProject(c: Context) {
    const currentUser = getCurrentUser(c)
    const projectId = c.req.param("id")
    if (!projectId) throw new HTTPException(400, "Missing project ID")
    const query = c.req.query()
    const parsedParams = taskQuerySchema.parse(query)
    const result = await taskService.getTasksByProject(projectId, parsedParams, currentUser)
    return c.json(result, 200)
  }

  async getTaskById(c: Context) {
    const currentUser = getCurrentUser(c)
    const id = c.req.param("id")
    if (!id) throw new HTTPException(400, "Missing task ID")
    const result = await taskService.getTaskById(id, currentUser)
    return c.json(result, 200)
  }

  async createTask(c: Context) {
    const currentUser = getCurrentUser(c)
    const projectId = c.req.param("id")
    if (!projectId) throw new HTTPException(400, "Missing project ID")
    const body = await c.req.json()
    const parsed = createTaskSchema.parse(body)
    const result = await taskService.createTask(projectId, parsed, currentUser)
    return c.json(result, 201)
  }

  async updateTask(c: Context) {
    const currentUser = getCurrentUser(c)
    const id = c.req.param("id")
    if (!id) throw new HTTPException(400, "Missing task ID")
    const body = await c.req.json()
    const parsed = updateTaskSchema.parse(body)
    const result = await taskService.updateTask(id, parsed, currentUser)
    return c.json(result, 200)
  }

  async deleteTask(c: Context) {
    const currentUser = getCurrentUser(c)
    const id = c.req.param("id")
    if (!id) throw new HTTPException(400, "Missing task ID")
    const result = await taskService.deleteTask(id, currentUser)
    return c.json(result, 200)
  }

  async getAuditLogs(c: Context) {
    const currentUser = getCurrentUser(c)
    const id = c.req.param("id")
    if (!id) throw new HTTPException(400, "Missing task ID")
    const result = await taskService.getTaskAuditLogs(id, currentUser)
    return c.json(result, 200)
  }
}

export const taskController = new TaskController()
