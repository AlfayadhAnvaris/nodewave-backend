import { Role } from "@prisma/client"
import { toProjectMemberResponse, toProjectResponse } from "../dto/project.dto"
import { HTTPException } from "../errors/http.error"
import { projectPolicy } from "../policies/project.policy"
import { projectRepository } from "../repositories/project.repository"
import { userRepository } from "../repositories/user.repository"
import type { CreateProjectInput, ProjectQueryParams, UpdateProjectInput } from "../schemas/project.schema"
import type { JWTPayload } from "../types/auth.types"
import type { PaginatedResponse, ProjectMemberResponse, ProjectResponse } from "../types/project.types"

export class ProjectService {
  async getProjects(
    currentUser: JWTPayload,
    params: ProjectQueryParams,
  ): Promise<PaginatedResponse<ProjectResponse>> {
    const isPM = currentUser.role === Role.PM
    const result = await projectRepository.findMany(
      currentUser.companyId,
      currentUser.userId,
      isPM,
      params,
    )

    return {
      data: result.data.map(toProjectResponse),
      meta: result.meta,
    }
  }

  async getProjectById(id: string, currentUser: JWTPayload): Promise<ProjectResponse> {
    const project = await projectRepository.findById(id, currentUser.companyId)
    if (!project) {
      throw new HTTPException(404, "Project not found")
    }

    const isMember = await projectRepository.isMember(id, currentUser.userId)
    projectPolicy.canViewProject(currentUser, project.company_id, isMember)

    return toProjectResponse(project)
  }

  async createProject(input: CreateProjectInput, currentUser: JWTPayload): Promise<ProjectResponse> {
    projectPolicy.canCreateProject(currentUser)
    const project = await projectRepository.create(currentUser.companyId, input, currentUser.userId)
    return toProjectResponse(project)
  }

  async updateProject(
    id: string,
    input: UpdateProjectInput,
    currentUser: JWTPayload,
  ): Promise<ProjectResponse> {
    const project = await projectRepository.findById(id, currentUser.companyId)
    if (!project) {
      throw new HTTPException(404, "Project not found")
    }

    projectPolicy.canUpdateProject(currentUser, project.company_id)
    const updated = await projectRepository.update(id, input)
    return toProjectResponse(updated)
  }

  async deleteProject(id: string, currentUser: JWTPayload): Promise<ProjectResponse> {
    const project = await projectRepository.findById(id, currentUser.companyId)
    if (!project) {
      throw new HTTPException(404, "Project not found")
    }

    projectPolicy.canDeleteProject(currentUser, project.company_id)
    const deleted = await projectRepository.softDelete(id)
    return toProjectResponse(deleted)
  }

  async getProjectMembers(projectId: string, currentUser: JWTPayload): Promise<ProjectMemberResponse[]> {
    const project = await projectRepository.findById(projectId, currentUser.companyId)
    if (!project) {
      throw new HTTPException(404, "Project not found")
    }

    const isMember = await projectRepository.isMember(projectId, currentUser.userId)
    projectPolicy.canViewProject(currentUser, project.company_id, isMember)

    const members = await projectRepository.findMembers(projectId)
    return members.map(toProjectMemberResponse)
  }

  async addProjectMember(
    projectId: string,
    targetUserId: string,
    currentUser: JWTPayload,
  ): Promise<ProjectMemberResponse> {
    const project = await projectRepository.findById(projectId, currentUser.companyId)
    if (!project) {
      throw new HTTPException(404, "Project not found")
    }

    projectPolicy.canManageMembers(currentUser, project.company_id)

    const targetUser = await userRepository.findById(targetUserId)
    if (!targetUser || targetUser.company_id !== currentUser.companyId) {
      throw new HTTPException(404, "User not found in your company")
    }

    const isAlreadyMember = await projectRepository.isMember(projectId, targetUserId)
    if (isAlreadyMember) {
      throw new HTTPException(409, "User is already a member of this project")
    }

    const newMember = await projectRepository.addMember(projectId, targetUserId)
    return toProjectMemberResponse(newMember)
  }

  async removeProjectMember(
    projectId: string,
    targetUserId: string,
    currentUser: JWTPayload,
  ): Promise<void> {
    const project = await projectRepository.findById(projectId, currentUser.companyId)
    if (!project) {
      throw new HTTPException(404, "Project not found")
    }

    projectPolicy.canManageMembers(currentUser, project.company_id)

    const isMember = await projectRepository.isMember(projectId, targetUserId)
    if (!isMember) {
      throw new HTTPException(404, "Member not found in project")
    }

    await projectRepository.removeMember(projectId, targetUserId)
  }
}

export const projectService = new ProjectService()
