import type { Task, User } from "@prisma/client"
import type { TaskResponse } from "../types/task.types"

export function toTaskResponse(task: Task & { assignee?: User | null }): TaskResponse {
  return {
    id: task.id,
    project_id: task.project_id,
    assignee_id: task.assignee_id,
    title: task.title,
    description: task.description,
    status: task.status,
    department: task.department,
    client_visible: task.client_visible,
    version: task.version,
    created_at: task.created_at,
    updated_at: task.updated_at,
    assignee: task.assignee
      ? {
          id: task.assignee.id,
          name: task.assignee.name,
          email: task.assignee.email,
          avatar_url: task.assignee.avatar_url,
        }
      : null,
  }
}
