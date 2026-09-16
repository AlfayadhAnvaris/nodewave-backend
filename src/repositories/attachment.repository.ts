import { PrismaClient, type TaskAttachment, type User } from "@prisma/client"

const prisma = new PrismaClient()

export class AttachmentRepository {
  async create(
    taskId: string,
    uploadedBy: string,
    fileName: string,
    fileUrl: string,
  ): Promise<TaskAttachment & { uploader: User }> {
    return await prisma.taskAttachment.create({
      data: {
        task_id: taskId,
        uploaded_by: uploadedBy,
        file_name: fileName,
        file_url: fileUrl,
      },
      include: {
        uploader: true,
      },
    })
  }

  async findByTaskId(taskId: string): Promise<(TaskAttachment & { uploader: User })[]> {
    return await prisma.taskAttachment.findMany({
      where: {
        task_id: taskId,
        deleted_at: null,
      },
      include: {
        uploader: true,
      },
      orderBy: { created_at: "desc" },
    })
  }

  async findById(id: string): Promise<(TaskAttachment & { uploader: User }) | null> {
    return await prisma.taskAttachment.findFirst({
      where: {
        id,
        deleted_at: null,
      },
      include: {
        uploader: true,
      },
    })
  }

  async softDelete(id: string): Promise<TaskAttachment> {
    return await prisma.taskAttachment.update({
      where: { id },
      data: {
        deleted_at: new Date(),
      },
    })
  }
}

export const attachmentRepository = new AttachmentRepository()
