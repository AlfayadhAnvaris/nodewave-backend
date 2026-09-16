import { Role, TaskStatus } from "@prisma/client"
import { HTTPException } from "../errors/http.error"
import type { JWTPayload } from "../types/auth.types"
import { authPolicy } from "./auth.policy"

export class TaskPolicy {
  canCreateTask(user: JWTPayload, projectCompanyId: string): void {
    authPolicy.validateTenantAccess(user, projectCompanyId)
    if (user.role !== Role.PM) {
      throw new HTTPException(403, "Only Product Managers can create tasks")
    }
  }

  canViewTask(user: JWTPayload, projectCompanyId: string, isMember: boolean, clientVisible: boolean): void {
    authPolicy.validateTenantAccess(user, projectCompanyId)

    if (user.role === Role.CLIENT && !clientVisible) {
      throw new HTTPException(403, "Access denied to internal task")
    }

    if (user.role !== Role.PM && !isMember) {
      throw new HTTPException(403, "Access denied: You are not a member of this project")
    }
  }

  canUpdateTask(
    user: JWTPayload,
    projectCompanyId: string,
    isMember: boolean,
    hasDescriptionChange: boolean,
    assigneeId: string | null,
    newStatus?: TaskStatus,
  ): void {
    authPolicy.validateTenantAccess(user, projectCompanyId)

    if (user.role === Role.CLIENT) {
      throw new HTTPException(403, "Client users are not permitted to modify tasks")
    }

    if (user.role !== Role.PM && !isMember) {
      throw new HTTPException(403, "Access denied to update this task")
    }

    if (hasDescriptionChange && user.role !== Role.PM) {
      throw new HTTPException(403, "Internal users cannot edit core task description")
    }

    if (newStatus === TaskStatus.DONE) {
      if (user.role === Role.PM) {
        throw new HTTPException(403, "Product Managers are rejected from directly completing tasks. Only assigned executors can set status to DONE.")
      }

      if (assigneeId && user.userId !== assigneeId) {
        throw new HTTPException(403, "Only the assigned executor can move this task to DONE")
      }
    }
  }

  canDeleteTask(user: JWTPayload, projectCompanyId: string): void {
    authPolicy.validateTenantAccess(user, projectCompanyId)
    if (user.role !== Role.PM) {
      throw new HTTPException(403, "Only Product Managers can delete tasks")
    }
  }
}

export const taskPolicy = new TaskPolicy()
