import type { Department, ProjectStatus, Role } from "@prisma/client"

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

export interface ProjectResponse {
  id: string
  company_id: string
  name: string
  description: string | null
  status: ProjectStatus
  created_at: Date
  updated_at: Date
}

export interface ProjectMemberUser {
  id: string
  name: string
  email: string
  role: Role
  department: Department
  avatar_url: string | null
}

export interface ProjectMemberResponse {
  id: string
  project_id: string
  user_id: string
  created_at: Date
  user: ProjectMemberUser
}
