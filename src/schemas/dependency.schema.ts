import { z } from "zod"

export const addDependencySchema = z.object({
  dependsOnTaskId: z.string().uuid("Invalid prerequisite task ID format"),
})

export type AddDependencyInput = z.infer<typeof addDependencySchema>
