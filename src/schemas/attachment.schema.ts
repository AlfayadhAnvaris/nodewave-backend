import { z } from "zod"

export const createAttachmentSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  fileUrl: z.string().min(1, "File URL is required"),
})

export type CreateAttachmentInput = z.infer<typeof createAttachmentSchema>
