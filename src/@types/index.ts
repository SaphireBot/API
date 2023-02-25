import { APIAttachment, APIEmbed, Attachment, AttachmentBuilder, AttachmentPayload, BufferResolvable, JSONEncodable } from "discord.js";
import { Stream } from "node:stream";
import { Response as UndiciResponse } from "undici"
import { DocumentSetOptions } from "mongoose";
import { Request } from "express"

export interface WebhookBodyRequest extends Request {
  webhookUrl: string,
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

export interface CommandsSaphire {
  name: string,
  id: string,
  category: string,
  description: string
}

export interface ResponseGetIp extends UndiciResponse {
  ip: string
}

export interface ModelType extends DocumentSetOptions {
  ip: string,
  id: string,
  username: string,
  avatar: string,
  discriminator: string,
  email: string,
  guildsOwner: object[],
  loginDate: number
}

export interface SaphireApiBotResponse {
  status: string
}

export interface DiscloudAppStatus {
  status: string
  message: string
  apps: {
    id: string
    name: string
    online: boolean,
    ramKilled: boolean,
    exitCode: number,
    ram: number,
    mainFile: string
    lang: string
    mods: [string]
    autoDeployGit: string
    autoRestart: boolean
  }
}

export interface UserData {
  id: string,
  username: string,
  avatar: string | null,
  avatar_decoration: string | null,
  discriminator: string,
  public_flags: number,
  flags: number,
  banner: string,
  banner_color: string,
  accent_color: number,
  locale: string,
  mfa_enabled: boolean,
  premium_type: number,
  email: string,
  verified: boolean
}

export interface DatabaseType {
  saphireResult: string | Error
  cacheResult: string | Error
}

export interface DiscordWebhook {
  type: 1,
  id: string,
  name: string,
  avatar: string | null,
  channel_id: string,
  guild_id: string,
  application_id: string,
  token: string,
  user: {
    id: string,
    username: string,
    display_name: string | null,
    avatar: string,
    avatar_decoration: string | null,
    discriminator: string,
    public_flags: number | null,
    bot: boolean
  }
}