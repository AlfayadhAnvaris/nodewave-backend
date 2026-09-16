export interface TaskAuditLogResponse {
  id: string
  task_id: string
  user_id: string
  changed_column: string
  old_value: string | null
  new_value: string | null
  created_at: Date
  user: {
    id: string
    name: string
    email: string
  }
}
