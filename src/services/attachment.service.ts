import { HTTPException } from "../errors/http.error"
import { taskPolicy } from "../policies/task.policy"
import { attachmentRepository } from "../repositories/attachment.repository"
import { auditRepository } from "../repositories/audit.repository"
import { projectRepository } from "../repositories/project.repository"
import { taskRepository } from "../repositories/task.repository"
import type { CreateAttachmentInput } from "../schemas/attachment.schema"
import type { TaskAttachmentResponse } from "../types/attachment.types"
import type { JWTPayload } from "../types/auth.types"

export class AttachmentService {
  async addAttachment(
    taskId: string,
    input: CreateAttachmentInput,
    currentUser: JWTPayload,
  ): Promise<TaskAttachmentResponse> {
    const task = await taskRepository.findById(taskId)
    if (!task) {
      throw new HTTPException(404, "Task not found")
    }

    const project = await projectRepository.findById(task.project_id, currentUser.companyId)
    if (!project) {
      throw new HTTPException(404, "Project not found in your company")
    }

    const isMember = await projectRepository.isMember(task.project_id, currentUser.userId)
    taskPolicy.canViewTask(currentUser, project.company_id, isMember, task.client_visible)

    const attachment = await attachmentRepository.create(
      taskId,
      currentUser.userId,
      input.fileName,
      input.fileUrl,
    )

    await auditRepository.createMany([
      {
        task_id: taskId,
        user_id: currentUser.userId,
        changed_column: "attachment",
        old_value: null,
        new_value: input.fileName,
      },
    ])

    return {
      id: attachment.id,
      task_id: attachment.task_id,
      uploaded_by: attachment.uploaded_by,
      file_name: attachment.file_name,
      file_url: attachment.file_url,
      created_at: attachment.created_at,
      uploader: {
        id: attachment.uploader.id,
        name: attachment.uploader.name,
        email: attachment.uploader.email,
      },
    }
  }

  async getAttachments(taskId: string, currentUser: JWTPayload): Promise<TaskAttachmentResponse[]> {
    const task = await taskRepository.findById(taskId)
    if (!task) {
      throw new HTTPException(404, "Task not found")
    }

    const project = await projectRepository.findById(task.project_id, currentUser.companyId)
    if (!project) {
      throw new HTTPException(404, "Project not found in your company")
    }

    const isMember = await projectRepository.isMember(task.project_id, currentUser.userId)
    taskPolicy.canViewTask(currentUser, project.company_id, isMember, task.client_visible)

    const attachments = await attachmentRepository.findByTaskId(taskId)
    return attachments.map((att) => ({
      id: att.id,
      task_id: att.task_id,
      uploaded_by: att.uploaded_by,
      file_name: att.file_name,
      file_url: att.file_url,
      created_at: att.created_at,
      uploader: {
        id: att.uploader.id,
        name: att.uploader.name,
        email: att.uploader.email,
      },
    }))
  }

  async deleteAttachment(attachmentId: string, currentUser: JWTPayload): Promise<void> {
    const attachment = await attachmentRepository.findById(attachmentId)
    if (!attachment) {
      throw new HTTPException(404, "Attachment not found")
    }

    const task = await taskRepository.findById(attachment.task_id)
    if (!task) {
      throw new HTTPException(404, "Task not found")
    }

    const project = await projectRepository.findById(task.project_id, currentUser.companyId)
    if (!project) {
      throw new HTTPException(404, "Project not found in your company")
    }

    const isMember = await projectRepository.isMember(task.project_id, currentUser.userId)
    taskPolicy.canViewTask(currentUser, project.company_id, isMember, task.client_visible)

    await attachmentRepository.softDelete(attachmentId)

    await auditRepository.createMany([
      {
        task_id: attachment.task_id,
        user_id: currentUser.userId,
        changed_column: "attachment_deleted",
        old_value: attachment.file_name,
        new_value: null,
      },
    ])
  }
}

export const attachmentService = new AttachmentService()
