import { buildResponse } from './fetch'

export type Data = Awaited<ReturnType<typeof buildResponse>>
