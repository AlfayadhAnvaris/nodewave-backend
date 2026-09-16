import type { Department, Role } from "@prisma/client"

export interface JWTPayload {
  userId: string
  email: string
  role: Role
  department: Department
  companyId: string
  exp: number
}

export interface UserResponse {
  id: string
  name: string
  email: string
  role: Role
  department: Department
  company_id: string
  avatar_url: string | null
  created_at: Date
}

export interface AuthResponse {
  user: UserResponse
  token: string
}
