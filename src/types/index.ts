import { buildResponse } from '../core/http/client'

export type Data = Awaited<ReturnType<typeof buildResponse>>
