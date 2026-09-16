import type { Task, TaskDependency } from "@prisma/client"
import type { TaskDependencyResponse } from "../types/dependency.types"

export function toTaskDependencyResponse(
  dep: TaskDependency & { depends_on_task: Task },
): TaskDependencyResponse {
  return {
    id: dep.id,
    task_id: dep.task_id,
    depends_on_task_id: dep.depends_on_task_id,
    created_at: dep.created_at,
    depends_on_task: {
      id: dep.depends_on_task.id,
      title: dep.depends_on_task.title,
      status: dep.depends_on_task.status,
      department: dep.depends_on_task.department,
    },
  }
}
