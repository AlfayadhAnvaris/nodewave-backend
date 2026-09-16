import type { Context } from "hono"
import { HTTPException } from "../errors/http.error"
import { getCurrentUser } from "../middlewares/auth.middleware"
import {
  addMemberSchema,
  createProjectSchema,
  projectQuerySchema,
  updateProjectSchema,
} from "../schemas/project.schema"
import { projectService } from "../services/project.service"

export class ProjectController {
  async getProjects(c: Context) {
    const currentUser = getCurrentUser(c)
    const query = c.req.query()
    const parsedParams = projectQuerySchema.parse(query)
    const result = await projectService.getProjects(currentUser, parsedParams)
    return c.json(result, 200)
  }

  async getProjectById(c: Context) {
    const currentUser = getCurrentUser(c)
    const id = c.req.param("id")
    if (!id) throw new HTTPException(400, "Missing project ID")
    const result = await projectService.getProjectById(id, currentUser)
    return c.json(result, 200)
  }

  async createProject(c: Context) {
    const currentUser = getCurrentUser(c)
    const body = await c.req.json()
    const parsed = createProjectSchema.parse(body)
    const result = await projectService.createProject(parsed, currentUser)
    return c.json(result, 201)
  }

  async updateProject(c: Context) {
    const currentUser = getCurrentUser(c)
    const id = c.req.param("id")
    if (!id) throw new HTTPException(400, "Missing project ID")
    const body = await c.req.json()
    const parsed = updateProjectSchema.parse(body)
    const result = await projectService.updateProject(id, parsed, currentUser)
    return c.json(result, 200)
  }

  async deleteProject(c: Context) {
    const currentUser = getCurrentUser(c)
    const id = c.req.param("id")
    if (!id) throw new HTTPException(400, "Missing project ID")
    const result = await projectService.deleteProject(id, currentUser)
    return c.json(result, 200)
  }

  async getMembers(c: Context) {
    const currentUser = getCurrentUser(c)
    const id = c.req.param("id")
    if (!id) throw new HTTPException(400, "Missing project ID")
    const result = await projectService.getProjectMembers(id, currentUser)
    return c.json(result, 200)
  }

  async addMember(c: Context) {
    const currentUser = getCurrentUser(c)
    const id = c.req.param("id")
    if (!id) throw new HTTPException(400, "Missing project ID")
    const body = await c.req.json()
    const parsed = addMemberSchema.parse(body)
    const result = await projectService.addProjectMember(id, parsed.userId, currentUser)
    return c.json(result, 201)
  }

  async removeMember(c: Context) {
    const currentUser = getCurrentUser(c)
    const id = c.req.param("id")
    const userId = c.req.param("userId")
    if (!id || !userId) throw new HTTPException(400, "Missing parameters")
    await projectService.removeProjectMember(id, userId, currentUser)
    return c.json({ message: "Member removed from project successfully" }, 200)
  }
}

export const projectController = new ProjectController()
