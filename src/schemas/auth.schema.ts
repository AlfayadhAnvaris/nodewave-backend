import { Department, Role } from "@prisma/client"
import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  companyName: z.string().min(2),
  role: z.nativeEnum(Role),
  department: z.nativeEnum(Department),
  avatarUrl: z.string().url().optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
