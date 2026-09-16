import { PrismaClient, type User } from "@prisma/client"
import type { RegisterInput } from "../schemas/auth.schema"

const prisma = new PrismaClient()

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findFirst({
      where: {
        email,
        deleted_at: null,
      },
    })
  }

  async findById(id: string): Promise<User | null> {
    return await prisma.user.findFirst({
      where: {
        id,
        deleted_at: null,
      },
    })
  }

  async createUserWithCompany(input: RegisterInput, passwordHash: string): Promise<User> {
    return await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name: input.companyName,
        },
      })

      return await tx.user.create({
        data: {
          company_id: company.id,
          name: input.name,
          email: input.email,
          password_hash: passwordHash,
          role: input.role,
          department: input.department,
          avatar_url: input.avatarUrl || null,
        },
      })
    })
  }
}

export const userRepository = new UserRepository()
