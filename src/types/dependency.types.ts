import type { Department, TaskStatus } from "@prisma/client"

export interface PrerequisiteTaskInfo {
  id: string
  title: string
  status: TaskStatus
  department: Department
}

export interface TaskDependencyResponse {
  id: string
  task_id: string
  depends_on_task_id: string
  created_at: Date
  depends_on_task: PrerequisiteTaskInfo
}
