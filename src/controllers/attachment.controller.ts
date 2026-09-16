import type { Context } from "hono"
import { HTTPException } from "../errors/http.error"
import { getCurrentUser } from "../middlewares/auth.middleware"
import { createAttachmentSchema } from "../schemas/attachment.schema"
import { attachmentService } from "../services/attachment.service"

export class AttachmentController {
  async addAttachment(c: Context) {
    const currentUser = getCurrentUser(c)
    const taskId = c.req.param("id")
    if (!taskId) throw new HTTPException(400, "Missing task ID")
    const body = await c.req.json()
    const parsed = createAttachmentSchema.parse(body)
    const result = await attachmentService.addAttachment(taskId, parsed, currentUser)
    return c.json(result, 201)
  }

  async getAttachments(c: Context) {
    const currentUser = getCurrentUser(c)
    const taskId = c.req.param("id")
    if (!taskId) throw new HTTPException(400, "Missing task ID")
    const result = await attachmentService.getAttachments(taskId, currentUser)
    return c.json(result, 200)
  }

  async deleteAttachment(c: Context) {
    const currentUser = getCurrentUser(c)
    const attachmentId = c.req.param("attachmentId")
    if (!attachmentId) throw new HTTPException(400, "Missing attachment ID")
    await attachmentService.deleteAttachment(attachmentId, currentUser)
    return c.json({ message: "Attachment soft deleted successfully" }, 200)
  }
}

export const attachmentController = new AttachmentController()
