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
      name: "NodeWave Enterprise Solutions",
    },
  })

  const companyB = await prisma.company.create({
    data: {
      name: "Global Logistics Corp",
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
      name: "Financial Management SaaS Platform",
      description: "Enterprise financial analytics, cash flow tracking, and automated ledger reporting system",
      status: ProjectStatus.ACTIVE,
    },
  })

  const projectB = await prisma.project.create({
    data: {
      company_id: companyA.id,
      name: "Client Portal & Billing Integration",
      description: "Customer self-service billing portal, invoice generation, and real-time subscription management",
      status: ProjectStatus.ACTIVE,
    },
  })

  const projectC = await prisma.project.create({
    data: {
      company_id: companyA.id,
      name: "Q4 Enterprise ERP & Inventory Suite",
      description: "Centralized supply chain, procurement, and financial forecasting platform for enterprise clients",
      status: ProjectStatus.PLANNING,
    },
  })

  await prisma.project.create({
    data: {
      company_id: companyB.id,
      name: "Internal Freight CRM",
      description: "Private logistics CRM platform for Global Logistics Corp",
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

      { project_id: projectB.id, user_id: pmUser.id },
      { project_id: projectB.id, user_id: frontendUser.id },
      { project_id: projectB.id, user_id: backendUser.id },
      { project_id: projectB.id, user_id: clientUser.id },

      { project_id: projectC.id, user_id: pmUser.id },
      { project_id: projectC.id, user_id: uiuxUser.id },
      { project_id: projectC.id, user_id: frontendUser.id },
      { project_id: projectC.id, user_id: backendUser.id },
    ],
  })

  const task1 = await prisma.task.create({
    data: {
      project_id: projectA.id,
      assignee_id: uiuxUser.id,
      title: "Design System & Financial UI Wireframes",
      description: "Create minimalist design system tokens, typography scales, and high-readability cash flow card components",
      status: TaskStatus.DONE,
      department: Department.UI_UX,
      client_visible: true,
    },
  })

  const task2 = await prisma.task.create({
    data: {
      project_id: projectA.id,
      assignee_id: backendUser.id,
      title: "Ledger Transaction API & Optimistic Concurrency Engine",
      description: "Implement high-throughput transaction endpoints with atomic version locking (409 Conflict protection)",
      status: TaskStatus.DONE,
      department: Department.BACKEND,
      client_visible: false,
    },
  })

  const task3 = await prisma.task.create({
    data: {
      project_id: projectA.id,
      assignee_id: frontendUser.id,
      title: "Interactive Drag-and-Drop Kanban Board Slicing",
      description: "Build Next.js drag-and-drop Kanban task board with status persistence and policy error rollbacks",
      status: TaskStatus.IN_PROGRESS,
      department: Department.FRONTEND,
      client_visible: true,
    },
  })

  const task4 = await prisma.task.create({
    data: {
      project_id: projectA.id,
      assignee_id: pmUser.id,
      title: "Client Financial Statement Audit Export",
      description: "Define export protocols for PDF/CSV financial statements and tenant-isolated client portal views",
      status: TaskStatus.TODO,
      department: Department.PRODUCT,
      client_visible: true,
    },
  })

  const task5 = await prisma.task.create({
    data: {
      project_id: projectA.id,
      assignee_id: backendUser.id,
      title: "Multi-Tenant Isolation & Security Audit",
      description: "Enforce strict company_id scoping and data masking on client API endpoints",
      status: TaskStatus.BLOCKED,
      department: Department.BACKEND,
      client_visible: false,
    },
  })

  const task6 = await prisma.task.create({
    data: {
      project_id: projectA.id,
      assignee_id: uiuxUser.id,
      title: "Financial Analytics & Cash Flow Chart Redesign",
      description: "Design monochrome financial line charts and department workload donut distribution cards",
      status: TaskStatus.DONE,
      department: Department.UI_UX,
      client_visible: true,
    },
  })

  const task7 = await prisma.task.create({
    data: {
      project_id: projectA.id,
      assignee_id: frontendUser.id,
      title: "Toast Notification Popups & Error Feedback UX",
      description: "Implement top-right floating toast notification system for success, warning, and error alerts",
      status: TaskStatus.DONE,
      department: Department.FRONTEND,
      client_visible: true,
    },
  })

  const task8 = await prisma.task.create({
    data: {
      project_id: projectA.id,
      assignee_id: backendUser.id,
      title: "Immutable Audit Trail Logging Engine",
      description: "Build transactional append-only log recorder tracking changed columns, old values, and new values",
      status: TaskStatus.IN_PROGRESS,
      department: Department.BACKEND,
      client_visible: false,
    },
  })

  await prisma.taskDependency.createMany({
    data: [
      { task_id: task3.id, depends_on_task_id: task1.id },
      { task_id: task3.id, depends_on_task_id: task2.id },
      { task_id: task5.id, depends_on_task_id: task3.id },
      { task_id: task7.id, depends_on_task_id: task6.id },
    ],
  })

  await prisma.taskAttachment.createMany({
    data: [
      {
        task_id: task1.id,
        uploaded_by: uiuxUser.id,
        file_name: "Financial_UI_Wireframes_v2.pdf",
        file_url: "https://example.com/files/wireframes.pdf",
      },
      {
        task_id: task2.id,
        uploaded_by: backendUser.id,
        file_name: "Transaction_API_Benchmark_Report.json",
        file_url: "https://example.com/files/api_benchmark.json",
      },
      {
        task_id: task7.id,
        uploaded_by: frontendUser.id,
        file_name: "Toast_Notification_UX_Specs.png",
        file_url: "https://example.com/files/toast_specs.png",
      },
    ],
  })

  await prisma.taskAuditLog.createMany({
    data: [
      {
        task_id: task1.id,
        user_id: uiuxUser.id,
        changed_column: "status",
        old_value: "IN_PROGRESS",
        new_value: "DONE",
      },
      {
        task_id: task2.id,
        user_id: backendUser.id,
        changed_column: "status",
        old_value: "IN_PROGRESS",
        new_value: "DONE",
      },
      {
        task_id: task3.id,
        user_id: frontendUser.id,
        changed_column: "status",
        old_value: "TODO",
        new_value: "IN_PROGRESS",
      },
    ],
  })

  await prisma.task.createMany({
    data: [
      {
        project_id: projectB.id,
        assignee_id: backendUser.id,
        title: "Stripe Payment Gateway Integration",
        description: "Integrate recurring subscription webhooks and automated billing invoice creation",
        status: TaskStatus.DONE,
        department: Department.BACKEND,
        client_visible: true,
      },
      {
        project_id: projectB.id,
        assignee_id: frontendUser.id,
        title: "Client Self-Service Invoicing Interface",
        description: "Build client billing dashboard with invoice download links and payment status indicators",
        status: TaskStatus.IN_PROGRESS,
        department: Department.FRONTEND,
        client_visible: true,
      },
      {
        project_id: projectB.id,
        assignee_id: pmUser.id,
        title: "Billing Subscription Terms & Refund Policy Specification",
        description: "Formulate automated refund workflows and credit note adjustments for enterprise clients",
        status: TaskStatus.TODO,
        department: Department.PRODUCT,
        client_visible: true,
      },
      {
        project_id: projectC.id,
        assignee_id: pmUser.id,
        title: "Procurement Workflow Requirements Specification",
        description: "Gather enterprise procurement user stories and approval matrix criteria",
        status: TaskStatus.IN_PROGRESS,
        department: Department.PRODUCT,
        client_visible: true,
      },
      {
        project_id: projectC.id,
        assignee_id: uiuxUser.id,
        title: "Supply Chain & Stock Tracking Mockups",
        description: "Design real-time warehouse inventory monitoring screens and threshold alert triggers",
        status: TaskStatus.TODO,
        department: Department.UI_UX,
        client_visible: true,
      },
      {
        project_id: projectC.id,
        assignee_id: backendUser.id,
        title: "PostgreSQL Database Schema Migration for Inventory",
        description: "Draft Prisma schema migrations for stock items, purchase orders, and supplier ledgers",
        status: TaskStatus.TODO,
        department: Department.BACKEND,
        client_visible: false,
      },
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
