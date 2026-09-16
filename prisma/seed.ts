import { Department, PrismaClient, ProjectStatus, Role, TaskStatus } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  await prisma.taskAuditLog.deleteMany()
  await prisma.taskAttachment.deleteMany()
  await prisma.taskDependency.deleteMany()
  await prisma.task.deleteMany()
  await prisma.projectMember.deleteMany()
  await prisma.project.deleteMany()
  await prisma.user.deleteMany()
  await prisma.company.deleteMany()

  const companyA = await prisma.company.create({
    data: {
      name: "Company A",
    },
  })

  const companyB = await prisma.company.create({
    data: {
      name: "Company B",
    },
  })

  const passwordHash = await bcrypt.hash("Password123!", 10)

  const pmUser = await prisma.user.create({
    data: {
      company_id: companyA.id,
      name: "Product Manager",
      email: "pm@example.com",
      password_hash: passwordHash,
      role: Role.PM,
      department: Department.PRODUCT,
    },
  })

  const uiuxUser = await prisma.user.create({
    data: {
      company_id: companyA.id,
      name: "UI/UX Designer",
      email: "uiux@example.com",
      password_hash: passwordHash,
      role: Role.INTERNAL,
      department: Department.UI_UX,
    },
  })

  const frontendUser = await prisma.user.create({
    data: {
      company_id: companyA.id,
      name: "Frontend Engineer",
      email: "frontend@example.com",
      password_hash: passwordHash,
      role: Role.INTERNAL,
      department: Department.FRONTEND,
    },
  })

  const backendUser = await prisma.user.create({
    data: {
      company_id: companyA.id,
      name: "Backend Engineer",
      email: "backend@example.com",
      password_hash: passwordHash,
      role: Role.INTERNAL,
      department: Department.BACKEND,
    },
  })

  const clientUser = await prisma.user.create({
    data: {
      company_id: companyA.id,
      name: "Client Guest",
      email: "client@example.com",
      password_hash: passwordHash,
      role: Role.CLIENT,
      department: Department.CLIENT,
    },
  })

  const projectA = await prisma.project.create({
    data: {
      company_id: companyA.id,
      name: "E-Commerce Platform",
      description: "Main product development for Company A",
      status: ProjectStatus.ACTIVE,
    },
  })

  await prisma.project.create({
    data: {
      company_id: companyB.id,
      name: "Internal CRM",
      description: "Private CRM for Company B",
      status: ProjectStatus.ACTIVE,
    },
  })

  await prisma.projectMember.createMany({
    data: [
      { project_id: projectA.id, user_id: pmUser.id },
      { project_id: projectA.id, user_id: uiuxUser.id },
      { project_id: projectA.id, user_id: frontendUser.id },
      { project_id: projectA.id, user_id: backendUser.id },
      { project_id: projectA.id, user_id: clientUser.id },
    ],
  })

  const uiuxTask = await prisma.task.create({
    data: {
      project_id: projectA.id,
      assignee_id: uiuxUser.id,
      title: "Design System & Wireframes",
      description: "Create component library and layout designs",
      status: TaskStatus.TODO,
      department: Department.UI_UX,
      client_visible: true,
    },
  })

  const backendTask = await prisma.task.create({
    data: {
      project_id: projectA.id,
      assignee_id: backendUser.id,
      title: "API Endpoint Architecture",
      description: "Build RESTful API and authentication services",
      status: TaskStatus.TODO,
      department: Department.BACKEND,
      client_visible: false,
    },
  })

  const frontendTask = await prisma.task.create({
    data: {
      project_id: projectA.id,
      assignee_id: frontendUser.id,
      title: "Frontend Application Integration",
      description: "Connect Next.js UI with backend API endpoints",
      status: TaskStatus.BLOCKED,
      department: Department.FRONTEND,
      client_visible: true,
    },
  })

  await prisma.taskDependency.createMany({
    data: [
      { task_id: frontendTask.id, depends_on_task_id: uiuxTask.id },
      { task_id: frontendTask.id, depends_on_task_id: backendTask.id },
    ],
  })
}

main()
  .catch(() => {
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
