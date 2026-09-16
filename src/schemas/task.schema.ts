import { Department, TaskStatus } from "@prisma/client"
import { z } from "zod"

export const createTaskSchema = z.object({
  title: z.string().min(2, "Task title must be at least 2 characters"),
  description: z.string().optional(),
  assigneeId: z.string().uuid("Invalid assignee ID").optional().nullable(),
  department: z.nativeEnum(Department),
  clientVisible: z.boolean().optional().default(false),
})

export const updateTaskSchema = z.object({
  title: z.string().min(2, "Task title must be at least 2 characters").optional(),
  description: z.string().optional().nullable(),
  assigneeId: z.string().uuid("Invalid assignee ID").optional().nullable(),
  department: z.nativeEnum(Department).optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  clientVisible: z.boolean().optional(),
})

export const taskQuerySchema = z.object({
  status: z.nativeEnum(TaskStatus).optional(),
  department: z.nativeEnum(Department).optional(),
  assigneeId: z.string().optional(),
  clientVisible: z.enum(["true", "false"]).optional(),
  search: z.string().optional(),
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
export type TaskQueryParams = z.infer<typeof taskQuerySchema>
