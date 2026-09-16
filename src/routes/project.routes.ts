import { Hono } from "hono"
import { projectController } from "../controllers/project.controller"
import { authMiddleware } from "../middlewares/auth.middleware"

export const projectRoutes = new Hono()

projectRoutes.use("*", authMiddleware)

projectRoutes.get("/", (c) => projectController.getProjects(c))
projectRoutes.post("/", (c) => projectController.createProject(c))
projectRoutes.get("/:id", (c) => projectController.getProjectById(c))
projectRoutes.patch("/:id", (c) => projectController.updateProject(c))
projectRoutes.delete("/:id", (c) => projectController.deleteProject(c))

projectRoutes.get("/:id/members", (c) => projectController.getMembers(c))
projectRoutes.post("/:id/members", (c) => projectController.addMember(c))
projectRoutes.delete("/:id/members/:userId", (c) => projectController.removeMember(c))
