import { Role } from "@prisma/client"
import { HTTPException } from "../errors/http.error"
import type { JWTPayload } from "../types/auth.types"
import { authPolicy } from "./auth.policy"

export class ProjectPolicy {
  canCreateProject(user: JWTPayload): void {
    if (user.role !== Role.PM) {
      throw new HTTPException(403, "Only Product Managers can create projects")
    }
  }

  canViewProject(user: JWTPayload, projectCompanyId: string, isMember: boolean): void {
    authPolicy.validateTenantAccess(user, projectCompanyId)
    if (user.role !== Role.PM && !isMember) {
      throw new HTTPException(403, "Access denied: You are not a member of this project")
    }
  }

  canUpdateProject(user: JWTPayload, projectCompanyId: string): void {
    authPolicy.validateTenantAccess(user, projectCompanyId)
    if (user.role !== Role.PM) {
      throw new HTTPException(403, "Only Product Managers can update projects")
    }
  }

  canDeleteProject(user: JWTPayload, projectCompanyId: string): void {
    authPolicy.validateTenantAccess(user, projectCompanyId)
    if (user.role !== Role.PM) {
      throw new HTTPException(403, "Only Product Managers can delete projects")
    }
  }

  canManageMembers(user: JWTPayload, projectCompanyId: string): void {
    authPolicy.validateTenantAccess(user, projectCompanyId)
    if (user.role !== Role.PM) {
      throw new HTTPException(403, "Only Product Managers can manage project members")
    }
  }
}

export const projectPolicy = new ProjectPolicy()
