import type { Department, TaskStatus } from "@prisma/client"

export interface TaskAssigneeResponse {
  id: string
  name: string
  email: string
  avatar_url: string | null
}

export interface TaskResponse {
  id: string
  project_id: string
  assignee_id: string | null
  title: string
  description: string | null
  status: TaskStatus
  department: Department
  client_visible: boolean
  version: number
  created_at: Date
  updated_at: Date
  assignee?: TaskAssigneeResponse | null
}
