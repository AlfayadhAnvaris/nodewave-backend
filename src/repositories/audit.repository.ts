import { PrismaClient, type TaskAuditLog, type User } from "@prisma/client"

const prisma = new PrismaClient()

export interface CreateAuditLogEntry {
  task_id: string
  user_id: string
  changed_column: string
  old_value: string | null
  new_value: string | null
}

export class AuditRepository {
  async createMany(entries: CreateAuditLogEntry[]): Promise<void> {
    if (entries.length === 0) return
    await prisma.taskAuditLog.createMany({
      data: entries,
    })
  }

  async findByTaskId(taskId: string): Promise<(TaskAuditLog & { user: User })[]> {
    return await prisma.taskAuditLog.findMany({
      where: { task_id: taskId },
      include: { user: true },
      orderBy: { created_at: "desc" },
    })
  }
}

export const auditRepository = new AuditRepository()
