import { Role, TaskStatus } from "@prisma/client"
import { toTaskResponse } from "../dto/task.dto"
import { HTTPException } from "../errors/http.error"
import { taskPolicy } from "../policies/task.policy"
import { projectRepository } from "../repositories/project.repository"
import { taskRepository } from "../repositories/task.repository"
import { dependencyRepository } from "../repositories/dependency.repository"
import { auditRepository } from "../repositories/audit.repository"
import type { CreateTaskInput, TaskQueryParams, UpdateTaskInput } from "../schemas/task.schema"
import type { TaskAuditLogResponse } from "../types/audit.types"
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
    await auditRepository.createMany([
      {
        task_id: task.id,
        user_id: currentUser.userId,
        changed_column: "task",
        old_value: null,
        new_value: "CREATED",
      },
    ])
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

    const expectedVersion = input.version ?? existingTask.version

    if (input.status === TaskStatus.IN_PROGRESS) {
      const unfinishedPrereqs = await dependencyRepository.getUnfinishedPrerequisites(id)
      if (unfinishedPrereqs.length > 0) {
        const titles = unfinishedPrereqs.map((t) => `"${t.title}" (${t.status})`).join(", ")
        await taskRepository.updateWithLock(id, expectedVersion, { status: TaskStatus.BLOCKED })
        throw new HTTPException(
          400,
          `Cannot move task to IN_PROGRESS. Prerequisite tasks are not DONE: ${titles}`,
        )
      }
    }

    const auditEntries = []

    if (input.title !== undefined && input.title !== existingTask.title) {
      auditEntries.push({
        task_id: id,
        user_id: currentUser.userId,
        changed_column: "title",
        old_value: existingTask.title,
        new_value: input.title,
      })
    }
    if (input.description !== undefined && input.description !== existingTask.description) {
      auditEntries.push({
        task_id: id,
        user_id: currentUser.userId,
        changed_column: "description",
        old_value: existingTask.description,
        new_value: input.description ?? null,
      })
    }
    if (input.status !== undefined && input.status !== existingTask.status) {
      auditEntries.push({
        task_id: id,
        user_id: currentUser.userId,
        changed_column: "status",
        old_value: existingTask.status,
        new_value: input.status,
      })
    }
    if (input.department !== undefined && input.department !== existingTask.department) {
      auditEntries.push({
        task_id: id,
        user_id: currentUser.userId,
        changed_column: "department",
        old_value: existingTask.department,
        new_value: input.department,
      })
    }
    if (input.assigneeId !== undefined && input.assigneeId !== existingTask.assignee_id) {
      auditEntries.push({
        task_id: id,
        user_id: currentUser.userId,
        changed_column: "assignee_id",
        old_value: existingTask.assignee_id,
        new_value: input.assigneeId ?? null,
      })
    }
    if (input.clientVisible !== undefined && input.clientVisible !== existingTask.client_visible) {
      auditEntries.push({
        task_id: id,
        user_id: currentUser.userId,
        changed_column: "client_visible",
        old_value: String(existingTask.client_visible),
        new_value: String(input.clientVisible),
      })
    }

    const updated = await taskRepository.updateWithLock(id, expectedVersion, input)
    if (!updated) {
      const currentTask = await taskRepository.findById(id)
      if (!currentTask) {
        throw new HTTPException(404, "Task not found")
      }
      throw new HTTPException(
        409,
        "Conflict: Task has been modified by another user. Please refresh and try again.",
      )
    }

    await auditRepository.createMany(auditEntries)
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
    await auditRepository.createMany([
      {
        task_id: id,
        user_id: currentUser.userId,
        changed_column: "deleted_at",
        old_value: null,
        new_value: new Date().toISOString(),
      },
    ])
    return toTaskResponse(deleted)
  }

  async getTaskAuditLogs(
    taskId: string,
    currentUser: JWTPayload,
  ): Promise<TaskAuditLogResponse[]> {
    const task = await taskRepository.findById(taskId)
    if (!task) {
      throw new HTTPException(404, "Task not found")
    }

    const project = await projectRepository.findById(task.project_id, currentUser.companyId)
    if (!project) {
      throw new HTTPException(404, "Project not found in your company")
    }

    const isMember = await projectRepository.isMember(task.project_id, currentUser.userId)
    taskPolicy.canViewTask(currentUser, project.company_id, isMember, task.client_visible)

    const logs = await auditRepository.findByTaskId(taskId)
    return logs.map((log) => ({
      id: log.id,
      task_id: log.task_id,
      user_id: log.user_id,
      changed_column: log.changed_column,
      old_value: log.old_value,
      new_value: log.new_value,
      created_at: log.created_at,
      user: {
        id: log.user.id,
        name: log.user.name,
        email: log.user.email,
      },
    }))
  }
}

export const taskService = new TaskService()
