import { PrismaClient, type Task, type User } from "@prisma/client"
import type { CreateTaskInput, TaskQueryParams, UpdateTaskInput } from "../schemas/task.schema"

const prisma = new PrismaClient()

export class TaskRepository {
  async findByProjectId(
    projectId: string,
    params: TaskQueryParams,
    isClient: boolean,
  ): Promise<(Task & { assignee: User | null })[]> {
    const { status, department, assigneeId, clientVisible, search } = params

    const whereCondition: Record<string, unknown> = {
      project_id: projectId,
      deleted_at: null,
    }

    if (isClient) {
      whereCondition.client_visible = true
    } else if (clientVisible !== undefined) {
      whereCondition.client_visible = clientVisible === "true"
    }

    if (status) {
      whereCondition.status = status
    }

    if (department) {
      whereCondition.department = department
    }

    if (assigneeId) {
      whereCondition.assignee_id = assigneeId
    }

    if (search) {
      whereCondition.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    return await prisma.task.findMany({
      where: whereCondition,
      include: {
        assignee: true,
      },
      orderBy: { created_at: "asc" },
    })
  }

  async findById(id: string): Promise<(Task & { assignee: User | null }) | null> {
    return await prisma.task.findFirst({
      where: {
        id,
        deleted_at: null,
      },
      include: {
        assignee: true,
      },
    })
  }

  async create(projectId: string, input: CreateTaskInput): Promise<Task & { assignee: User | null }> {
    return await prisma.task.create({
      data: {
        project_id: projectId,
        assignee_id: input.assigneeId || null,
        title: input.title,
        description: input.description || null,
        department: input.department,
        client_visible: input.clientVisible ?? false,
      },
      include: {
        assignee: true,
      },
    })
  }

  async update(id: string, input: UpdateTaskInput): Promise<Task & { assignee: User | null }> {
    return await prisma.task.update({
      where: { id },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.assigneeId !== undefined && { assignee_id: input.assigneeId }),
        ...(input.department !== undefined && { department: input.department }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.clientVisible !== undefined && { client_visible: input.clientVisible }),
      },
      include: {
        assignee: true,
      },
    })
  }

  async softDelete(id: string): Promise<Task> {
    return await prisma.task.update({
      where: { id },
      data: {
        deleted_at: new Date(),
      },
    })
  }
}

export const taskRepository = new TaskRepository()
