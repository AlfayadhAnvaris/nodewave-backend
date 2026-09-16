import { Hono } from "hono"
import { taskController } from "../controllers/task.controller"
import { authMiddleware } from "../middlewares/auth.middleware"

export const taskRoutes = new Hono()

taskRoutes.use("*", authMiddleware)

taskRoutes.get("/:id", (c) => taskController.getTaskById(c))
taskRoutes.patch("/:id", (c) => taskController.updateTask(c))
taskRoutes.delete("/:id", (c) => taskController.deleteTask(c))
