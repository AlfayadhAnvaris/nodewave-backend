import { Role, TaskStatus } from "@prisma/client"
import { toTaskResponse } from "../dto/task.dto"
import { HTTPException } from "../errors/http.error"
import { taskPolicy } from "../policies/task.policy"
import { projectRepository } from "../repositories/project.repository"
import { taskRepository } from "../repositories/task.repository"
import { dependencyRepository } from "../repositories/dependency.repository"
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

    const isMember = await projectRepository.isMember(projectId, currentUser.userId)
    taskPolicy.canViewTask(currentUser, project.company_id, isMember, true)

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

    const isMember = await projectRepository.isMember(task.project_id, currentUser.userId)
    taskPolicy.canViewTask(currentUser, project.company_id, isMember, task.client_visible)

    return toTaskResponse(task)
  }

  async createTask(
    projectId: string,
    input: CreateTaskInput,
    currentUser: JWTPayload,
  ): Promise<TaskResponse> {
    const project = await projectRepository.findById(projectId, currentUser.companyId)
    if (!project) {
      throw new HTTPException(404, "Project not found")
    }

    taskPolicy.canCreateTask(currentUser, project.company_id)

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

    const isMember = await projectRepository.isMember(existingTask.project_id, currentUser.userId)
    const hasDescriptionChange = input.description !== undefined && input.description !== existingTask.description
    const targetAssigneeId = input.assigneeId !== undefined ? input.assigneeId : existingTask.assignee_id

    taskPolicy.canUpdateTask(
      currentUser,
      project.company_id,
      isMember,
      hasDescriptionChange,
      targetAssigneeId,
      input.status,
    )

    if (input.status === TaskStatus.IN_PROGRESS) {
      const unfinishedPrereqs = await dependencyRepository.getUnfinishedPrerequisites(id)
      if (unfinishedPrereqs.length > 0) {
        const titles = unfinishedPrereqs.map((t) => `"${t.title}" (${t.status})`).join(", ")
        await taskRepository.update(id, { status: TaskStatus.BLOCKED })
        throw new HTTPException(
          400,
          `Cannot move task to IN_PROGRESS. Prerequisite tasks are not DONE: ${titles}`,
        )
      }
    }

    const updated = await taskRepository.update(id, input)
    return toTaskResponse(updated)
  }

  async deleteTask(id: string, currentUser: JWTPayload): Promise<TaskResponse> {
    const existingTask = await taskRepository.findById(id)
    if (!existingTask) {
      throw new HTTPException(404, "Task not found")
    }

    const project = await projectRepository.findById(existingTask.project_id, currentUser.companyId)
    if (!project) {
      throw new HTTPException(404, "Project not found in your company")
    }

    taskPolicy.canDeleteTask(currentUser, project.company_id)
    const deleted = await taskRepository.softDelete(id)
    return toTaskResponse(deleted)
  }
}

export const taskService = new TaskService()
