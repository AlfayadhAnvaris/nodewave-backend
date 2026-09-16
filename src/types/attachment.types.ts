export interface TaskAttachmentResponse {
  id: string
  task_id: string
  uploaded_by: string
  file_name: string
  file_url: string
  created_at: Date
  uploader: {
    id: string
    name: string
    email: string
  }
}
