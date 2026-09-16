import { Hono } from "hono"
import { attachmentController } from "../controllers/attachment.controller"
import { dependencyController } from "../controllers/dependency.controller"
import { taskController } from "../controllers/task.controller"
import { authMiddleware } from "../middlewares/auth.middleware"

export const taskRoutes = new Hono()

taskRoutes.use("*", authMiddleware)

taskRoutes.get("/:id", (c) => taskController.getTaskById(c))
taskRoutes.patch("/:id", (c) => taskController.updateTask(c))
taskRoutes.delete("/:id", (c) => taskController.deleteTask(c))

taskRoutes.get("/:id/dependencies", (c) => dependencyController.getDependencies(c))
taskRoutes.post("/:id/dependencies", (c) => dependencyController.addDependency(c))
taskRoutes.delete("/:id/dependencies/:dependencyId", (c) => dependencyController.removeDependency(c))

taskRoutes.get("/:id/audit-logs", (c) => taskController.getAuditLogs(c))

taskRoutes.get("/:id/attachments", (c) => attachmentController.getAttachments(c))
taskRoutes.post("/:id/attachments", (c) => attachmentController.addAttachment(c))
taskRoutes.delete("/attachments/:attachmentId", (c) => attachmentController.deleteAttachment(c))
