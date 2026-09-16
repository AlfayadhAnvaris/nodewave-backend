import { Role } from "@prisma/client"
import { toTaskResponse } from "../dto/task.dto"
import { HTTPException } from "../errors/http.error"
import { projectRepository } from "../repositories/project.repository"
import { taskRepository } from "../repositories/task.repository"
import type { CreateTaskInput, TaskQueryParams, UpdateTaskInput } from "../schemas/task.schema"
import type { JWTPayload } from "../types/auth.types"
import type { TaskResponse } from "../types/task.types"

export class TaskService {
  async getTasksByProject(
    projectId: string,
    params: TaskQueryParams,
    currentUser: JWTPayload,
  ): Promise<TaskResponse[]> {
    const project = await projectRepository.findById(projectId, currentUser.companyId)
    if (!project) {
      throw new HTTPException(404, "Project not found")
    }

    if (currentUser.role !== Role.PM) {
      const isMember = await projectRepository.isMember(projectId, currentUser.userId)
      if (!isMember) {
        throw new HTTPException(403, "Access denied to project tasks")
      }
    }

    const isClient = currentUser.role === Role.CLIENT
    const tasks = await taskRepository.findByProjectId(projectId, params, isClient)
    return tasks.map(toTaskResponse)
  }

  async getTaskById(id: string, currentUser: JWTPayload): Promise<TaskResponse> {
    const task = await taskRepository.findById(id)
    if (!task) {
      throw new HTTPException(404, "Task not found")
    }

    const project = await projectRepository.findById(task.project_id, currentUser.companyId)
    if (!project) {
      throw new HTTPException(404, "Project not found in your company")
    }

    if (currentUser.role === Role.CLIENT && !task.client_visible) {
      throw new HTTPException(403, "Access denied to internal task")
    }

    if (currentUser.role !== Role.PM) {
      const isMember = await projectRepository.isMember(task.project_id, currentUser.userId)
      if (!isMember) {
        throw new HTTPException(403, "Access denied to this task")
      }
    }

    return toTaskResponse(task)
  }

  async createTask(
    projectId: string,
    input: CreateTaskInput,
    currentUser: JWTPayload,
  ): Promise<TaskResponse> {
    if (currentUser.role !== Role.PM) {
      throw new HTTPException(403, "Only Product Managers can create tasks")
    }

    const project = await projectRepository.findById(projectId, currentUser.companyId)
    if (!project) {
      throw new HTTPException(404, "Project not found")
    }

    const task = await taskRepository.create(projectId, input)
    return toTaskResponse(task)
  }

  async updateTask(
    id: string,
    input: UpdateTaskInput,
    currentUser: JWTPayload,
  ): Promise<TaskResponse> {
    const existingTask = await taskRepository.findById(id)
    if (!existingTask) {
      throw new HTTPException(404, "Task not found")
    }

    const project = await projectRepository.findById(existingTask.project_id, currentUser.companyId)
    if (!project) {
      throw new HTTPException(404, "Project not found in your company")
    }

    const isPM = currentUser.role === Role.PM
    if (!isPM) {
      const isMember = await projectRepository.isMember(existingTask.project_id, currentUser.userId)
      if (!isMember) {
        throw new HTTPException(403, "Access denied to update this task")
      }
    }

    const updated = await taskRepository.update(id, input)
    return toTaskResponse(updated)
  }

  async deleteTask(id: string, currentUser: JWTPayload): Promise<TaskResponse> {
    if (currentUser.role !== Role.PM) {
      throw new HTTPException(403, "Only Product Managers can delete tasks")
    }

    const existingTask = await taskRepository.findById(id)
    if (!existingTask) {
      throw new HTTPException(404, "Task not found")
    }

    const project = await projectRepository.findById(existingTask.project_id, currentUser.companyId)
    if (!project) {
      throw new HTTPException(404, "Project not found in your company")
    }

    const deleted = await taskRepository.softDelete(id)
    return toTaskResponse(deleted)
  }
}

export const taskService = new TaskService()
