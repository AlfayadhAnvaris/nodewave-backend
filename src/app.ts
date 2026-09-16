import { Hono } from "hono"
import { cors } from "hono/cors"
import { errorHandler } from "./middlewares/error.middleware"
import { authRoutes } from "./routes/auth.routes"
import { projectRoutes } from "./routes/project.routes"
import { taskRoutes } from "./routes/task.routes"

export const app = new Hono()

app.use(
  "*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  }),
)

app.onError((err, c) => errorHandler(err, c))

app.get("/health", (c) => {
  return c.json({ status: "ok" })
})

app.route("/auth", authRoutes)
app.route("/projects", projectRoutes)
app.route("/tasks", taskRoutes)
