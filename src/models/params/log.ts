import { z } from "zod"

export const LogTransferObject = z.object({
    system_id: z.string(),
    result_id: z.number(),
    file: z.string()
})

export type LogTransfer = z.infer<typeof LogTransferObject>