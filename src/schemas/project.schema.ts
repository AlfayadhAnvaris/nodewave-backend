import { ProjectStatus } from "@prisma/client"
import { z } from "zod"

export const createProjectSchema = z.object({
  name: z.string().min(2, "Project name must be at least 2 characters"),
  description: z.string().optional(),
  status: z.nativeEnum(ProjectStatus).optional().default(ProjectStatus.ACTIVE),
})

export const updateProjectSchema = z.object({
  name: z.string().min(2, "Project name must be at least 2 characters").optional(),
  description: z.string().optional().nullable(),
  status: z.nativeEnum(ProjectStatus).optional(),
})

export const projectQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  search: z.string().optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
})

export const addMemberSchema = z.object({
  userId: z.string().uuid("Invalid user ID format"),
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
export type ProjectQueryParams = z.infer<typeof projectQuerySchema>
export type AddMemberInput = z.infer<typeof addMemberSchema>
