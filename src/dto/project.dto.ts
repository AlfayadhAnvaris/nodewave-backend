import type { Project, ProjectMember, User } from "@prisma/client"
import type { ProjectMemberResponse, ProjectResponse } from "../types/project.types"

export function toProjectResponse(project: Project): ProjectResponse {
  return {
    id: project.id,
    company_id: project.company_id,
    name: project.name,
    description: project.description,
    status: project.status,
    created_at: project.created_at,
    updated_at: project.updated_at,
  }
}

export function toProjectMemberResponse(member: ProjectMember & { user: User }): ProjectMemberResponse {
  return {
    id: member.id,
    project_id: member.project_id,
    user_id: member.user_id,
    created_at: member.created_at,
    user: {
      id: member.user.id,
      name: member.user.name,
      email: member.user.email,
      role: member.user.role,
      department: member.user.department,
      avatar_url: member.user.avatar_url,
    },
  }
}
