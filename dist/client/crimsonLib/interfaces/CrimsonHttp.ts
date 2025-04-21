import { FastifyReply, FastifyRequest } from "fastify";

export interface HttpContext {
  req: FastifyRequest,
  res: FastifyReply
}

export interface HttpPayload<TBody = undefined> {
  body?: TBody | undefined,
  query?: Record<string, string>
}