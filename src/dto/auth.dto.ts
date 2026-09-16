import type { User } from "@prisma/client"
import type { UserResponse } from "../types/auth.types"

export function toUserResponse(user: User): UserResponse {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    company_id: user.company_id,
    avatar_url: user.avatar_url,
    created_at: user.created_at,
  }
}
