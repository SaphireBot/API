import { APIAttachment, APIEmbed, Attachment, AttachmentBuilder, AttachmentPayload, BufferResolvable, JSONEncodable } from "discord.js"
import { Stream } from "node:stream"
import { FastifyReply, FastifyRequest } from "fastify";

export interface TopGGWebhookPostResult {
  user: string
  type: string
  query?: string
  bot: string
}

export interface WebhookBodyRequestBody {
  url: string,
  content: string,
  embeds: APIEmbed[],
  avatarURL: string,
  username: string,
  files: (
      | Stream
      | BufferResolvable
      | JSONEncodable<APIAttachment> 
      | Attachment
      | AttachmentBuilder
      | AttachmentPayload
    )[]
}

export interface Response {
  FastifyReply: FastifyReply
}

export interface Request {
  FastifyRequest: FastifyRequest
}