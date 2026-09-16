import { Role, TaskStatus } from "@prisma/client"
import { toTaskDependencyResponse } from "../dto/dependency.dto"
import { HTTPException } from "../errors/http.error"
import { projectRepository } from "../repositories/project.repository"
import { taskRepository } from "../repositories/task.repository"
import { dependencyRepository } from "../repositories/dependency.repository"
import type { JWTPayload } from "../types/auth.types"
import type { TaskDependencyResponse } from "../types/dependency.types"

export class DependencyService {
  async getDependencies(taskId: string, currentUser: JWTPayload): Promise<TaskDependencyResponse[]> {
    const task = await taskRepository.findById(taskId)
    if (!task) {
      throw new HTTPException(404, "Task not found")
    }

    const project = await projectRepository.findById(task.project_id, currentUser.companyId)
    if (!project) {
      throw new HTTPException(404, "Project not found in your company")
    }

    const dependencies = await dependencyRepository.findByTaskId(taskId)
    return dependencies.map(toTaskDependencyResponse)
  }

  async addDependency(
    taskId: string,
    dependsOnTaskId: string,
    currentUser: JWTPayload,
  ): Promise<TaskDependencyResponse> {
    if (currentUser.role !== Role.PM) {
      throw new HTTPException(403, "Only Product Managers can manage task dependencies")
    }

    if (taskId === dependsOnTaskId) {
      throw new HTTPException(400, "Self-dependency is not allowed")
    }

    const task = await taskRepository.findById(taskId)
    const dependsOnTask = await taskRepository.findById(dependsOnTaskId)

    if (!task || !dependsOnTask) {
      throw new HTTPException(404, "One or both tasks were not found")
    }

    if (task.project_id !== dependsOnTask.project_id) {
      throw new HTTPException(400, "Task dependencies must belong to the same project")
    }

    const project = await projectRepository.findById(task.project_id, currentUser.companyId)
    if (!project) {
      throw new HTTPException(404, "Project not found in your company")
    }

    const existing = await dependencyRepository.findExisting(taskId, dependsOnTaskId)
    if (existing) {
      throw new HTTPException(409, "Dependency relationship already exists")
    }

    const createsCycle = await dependencyRepository.wouldCreateCycle(taskId, dependsOnTaskId)
    if (createsCycle) {
      throw new HTTPException(400, "Circular dependency detected. Action rejected.")
    }

    const newDep = await dependencyRepository.create(taskId, dependsOnTaskId)

    if (dependsOnTask.status !== TaskStatus.DONE && task.status !== TaskStatus.BLOCKED) {
      await taskRepository.update(taskId, { status: TaskStatus.BLOCKED })
    }

    return toTaskDependencyResponse(newDep)
  }

  async removeDependency(
    taskId: string,
    dependencyId: string,
    currentUser: JWTPayload,
  ): Promise<void> {
    if (currentUser.role !== Role.PM) {
      throw new HTTPException(403, "Only Product Managers can remove task dependencies")
    }

    const task = await taskRepository.findById(taskId)
    if (!task) {
      throw new HTTPException(404, "Task not found")
    }

    const project = await projectRepository.findById(task.project_id, currentUser.companyId)
    if (!project) {
      throw new HTTPException(404, "Project not found in your company")
    }

    const deleted = await dependencyRepository.delete(dependencyId)
    if (!deleted) {
      throw new HTTPException(404, "Dependency not found")
    }

    const unfinishedPrereqs = await dependencyRepository.getUnfinishedPrerequisites(taskId)
    if (unfinishedPrereqs.length === 0 && task.status === TaskStatus.BLOCKED) {
      await taskRepository.update(taskId, { status: TaskStatus.TODO })
    }
  }
}

export const dependencyService = new DependencyService()
