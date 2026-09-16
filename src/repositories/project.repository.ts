import { PrismaClient, type Project, type ProjectMember, type User } from "@prisma/client"
import type { CreateProjectInput, ProjectQueryParams, UpdateProjectInput } from "../schemas/project.schema"
import type { PaginatedResponse } from "../types/project.types"

const prisma = new PrismaClient()

export class ProjectRepository {
  async findMany(
    companyId: string,
    userId: string,
    isPM: boolean,
    params: ProjectQueryParams,
  ): Promise<PaginatedResponse<Project>> {
    const { page, limit, search, status } = params
    const skip = (page - 1) * limit

    const whereCondition: Record<string, unknown> = {
      company_id: companyId,
      deleted_at: null,
    }

    if (status) {
      whereCondition.status = status
    }

    if (search) {
      whereCondition.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    if (!isPM) {
      whereCondition.members = {
        some: {
          user_id: userId,
        },
      }
    }

    const [total, data] = await Promise.all([
      prisma.project.count({ where: whereCondition }),
      prisma.project.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
      }),
    ])

    const totalPages = Math.ceil(total / limit) || 1

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    }
  }

  async findById(id: string, companyId: string): Promise<Project | null> {
    return await prisma.project.findFirst({
      where: {
        id,
        company_id: companyId,
        deleted_at: null,
      },
    })
  }

  async create(companyId: string, input: CreateProjectInput, creatorUserId: string): Promise<Project> {
    return await prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          company_id: companyId,
          name: input.name,
          description: input.description || null,
          status: input.status,
        },
      })

      await tx.projectMember.create({
        data: {
          project_id: project.id,
          user_id: creatorUserId,
        },
      })

      return project
    })
  }

  async update(id: string, input: UpdateProjectInput): Promise<Project> {
    return await prisma.project.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.status !== undefined && { status: input.status }),
      },
    })
  }

  async softDelete(id: string): Promise<Project> {
    return await prisma.project.update({
      where: { id },
      data: {
        deleted_at: new Date(),
      },
    })
  }

  async isMember(projectId: string, userId: string): Promise<boolean> {
    const member = await prisma.projectMember.findUnique({
      where: {
        project_id_user_id: {
          project_id: projectId,
          user_id: userId,
        },
      },
    })
    return Boolean(member)
  }

  async findMembers(projectId: string): Promise<(ProjectMember & { user: User })[]> {
    return await prisma.projectMember.findMany({
      where: {
        project_id: projectId,
        user: {
          deleted_at: null,
        },
      },
      include: {
        user: true,
      },
      orderBy: { created_at: "asc" },
    })
  }

  async addMember(projectId: string, userId: string): Promise<ProjectMember & { user: User }> {
    return await prisma.projectMember.create({
      data: {
        project_id: projectId,
        user_id: userId,
      },
      include: {
        user: true,
      },
    })
  }

  async removeMember(projectId: string, userId: string): Promise<void> {
    await prisma.projectMember.delete({
      where: {
        project_id_user_id: {
          project_id: projectId,
          user_id: userId,
        },
      },
    })
  }
}

export const projectRepository = new ProjectRepository()
