import { PrismaClient, TaskStatus, type Task, type TaskDependency } from "@prisma/client"

const prisma = new PrismaClient()

export class DependencyRepository {
  async findByTaskId(taskId: string): Promise<(TaskDependency & { depends_on_task: Task })[]> {
    return await prisma.taskDependency.findMany({
      where: {
        task_id: taskId,
        depends_on_task: {
          deleted_at: null,
        },
      },
      include: {
        depends_on_task: true,
      },
      orderBy: { created_at: "asc" },
    })
  }

  async findExisting(taskId: string, dependsOnTaskId: string): Promise<TaskDependency | null> {
    return await prisma.taskDependency.findUnique({
      where: {
        task_id_depends_on_task_id: {
          task_id: taskId,
          depends_on_task_id: dependsOnTaskId,
        },
      },
    })
  }

  async create(taskId: string, dependsOnTaskId: string): Promise<TaskDependency & { depends_on_task: Task }> {
    return await prisma.taskDependency.create({
      data: {
        task_id: taskId,
        depends_on_task_id: dependsOnTaskId,
      },
      include: {
        depends_on_task: true,
      },
    })
  }

  async delete(dependencyId: string): Promise<TaskDependency | null> {
    const existing = await prisma.taskDependency.findUnique({
      where: { id: dependencyId },
    })
    if (!existing) return null

    return await prisma.taskDependency.delete({
      where: { id: dependencyId },
    })
  }

  async wouldCreateCycle(taskId: string, dependsOnTaskId: string): Promise<boolean> {
    if (taskId === dependsOnTaskId) return true

    const visited = new Set<string>()
    const queue: string[] = [taskId]

    while (queue.length > 0) {
      const currentId = queue.shift() as string
      if (visited.has(currentId)) continue
      visited.add(currentId)

      const outgoing = await prisma.taskDependency.findMany({
        where: {
          depends_on_task_id: currentId,
          task: { deleted_at: null },
        },
        select: { task_id: true },
      })

      for (const edge of outgoing) {
        if (edge.task_id === dependsOnTaskId) {
          return true
        }
        if (!visited.has(edge.task_id)) {
          queue.push(edge.task_id)
        }
      }
    }

    return false
  }

  async getUnfinishedPrerequisites(taskId: string): Promise<Task[]> {
    const dependencies = await prisma.taskDependency.findMany({
      where: {
        task_id: taskId,
        depends_on_task: {
          deleted_at: null,
          status: {
            not: TaskStatus.DONE,
          },
        },
      },
      include: {
        depends_on_task: true,
      },
    })

    return dependencies.map((d) => d.depends_on_task)
  }
}

export const dependencyRepository = new DependencyRepository()
