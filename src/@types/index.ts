import { APIApplicationCommand, APIAttachment, APIEmbed, Attachment, AttachmentBuilder, AttachmentPayload, BufferResolvable, JSONEncodable, MessageReference, APIRole, APIMessageComponent, APIUser } from "discord.js";
import { Stream } from "node:stream";
import { DocumentSetOptions } from "mongoose";
import { Request, Response } from "express";
import { Socket } from "socket.io";
import { ReminderType } from "./reminder";
import { GuildSchemaType } from "../database/model/guilds";
import { UserSchemaType } from "../database/model/user";

export interface WebhookBodyRequest extends Request {
  webhookUrl: string
  content: string
  embeds: APIEmbed[]
  avatarURL: string
  username: string
  files: (
    | Stream
    | BufferResolvable
    | JSONEncodable<APIAttachment>
    | Attachment
    | AttachmentBuilder
    | AttachmentPayload
  )[]
}

export interface MessageSaphireRequest {
  content?: string | null
  message_reference?: MessageReference | null
  method: string | null
  channelId: string | null
  messageId?: string | null
  body?: any
  isReminder?: boolean
  components?: APIMessageComponent[] | []
  embeds?: APIEmbed[]
  tts?: boolean
}

export interface MessageToSendThroughWebsocket {
  method: "post" | "patch" | "delete" | undefined
  type: string | undefined
  channelId: string | undefined
  messageId?: string
  body?: MessageSaphireRequest
  guildId?: string
  authorization: string
  isWebsocket: boolean
  isReminder?: boolean
  LogType: string | undefined
}
export interface MessageToSendSaphireData {
  data: MessageSaphireRequest
  res?: Response
  socket?: Socket
}

export interface CommandsSaphire {
  name: string
  id: string
  category: string
  description: string
}

export interface ModelType extends DocumentSetOptions {
  ip: string
  id: string
  username: string
  avatar: string
  discriminator: string
  email: string
  guildsOwner: object[]
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
    online: boolean
    ramKilled: boolean
    exitCode: number
    ram: number
    mainFile: string
    lang: string
    mods: [string]
    autoDeployGit: string
    autoRestart: boolean
  }
}

export interface UserData {
  id: string
  username: string
  avatar: string | null
  avatar_decoration: string | null
  discriminator: string
  public_flags: number
  flags: number
  banner: string
  banner_color: string
  accent_color: number
  locale: string
  mfa_enabled: boolean
  premium_type: number
  email: string
  verified: boolean
}

export interface DatabaseType {
  saphireResult: string | Error
  cacheResult: string | Error
}

export interface DiscordWebhook {
  type: 1
  id: string
  name: string
  avatar: string | null
  channel_id: string
  guild_id: string
  application_id: string
  token: string
  user: {
    id: string
    username: string
    display_name: string | null
    avatar: string
    avatar_decoration: string | null
    discriminator: string
    public_flags: number | null
    bot: boolean
  }
}

export interface SaphireApiDataResponse {
  status: boolean
  interactions: number
  guilds: number
  users: number
  commands: number
  ping: number
  uptime: string
}

export interface WebsocketMessageRecieveData {
  type: "registerCommand" | "addInteraction" | "addMessage" | "apiCommandsData" | "guildCreate" | "guildDelete" | "shardStatus" | "updateCache" | "postMessage" | "deleteCache" | "AfkGlobalSystem" | "siteStaffData" | "updateManyStreamers" | "removeChannel" | "transactions" | "notification" | "chatMessage" | "ApplicationCommandData" | "postReminder" | "removeReminder" | "updateReminder" | "removeReminders" | "refreshReminder" | "refreshIDBlacklist" | "clearIDBlacklist" | undefined
  message: string | undefined
  shardId: number | undefined
  commandName: string | undefined
  listener: string | undefined
  guilds: number | undefined
  guildName: string
  commandsApi: commandApi[]
  shardData: ShardsStatus
  id: string
  to: "guild" | "user" | undefined
  data: GuildSchemaType[] | UserSchemaType[] | undefined
  messageData: MessageToSendThroughWebsocket
  userId: string
  method: "save" | "delete"
  staffData: staffData[]
  transactionsData: TransactionsNotificationSite
  notifyData: notifyData
  chatMessage: ChatMessage
  applicationCommandData: APIApplicationCommand[]
  reminderData: ReminderType
  remindersToRemove: string[]
  guildData: APIGuildObject
}

export interface staffData extends APIUser {
  avatarUrl: string | null
  tags: string[]
  social: {
    github: string | null
    instagram: string | null
    discord: string
  }
  description: string | null
}

export interface notifyData {
  userId: string
  message: string
  title: string | undefined
}

export interface TransactionsNotificationSite {
  userId: string
  value: number,
  method: "add" | "sub" | "set",
  transaction: TransactionsType
}

export interface TransactionsType {
  createdAt: Date
  value: number
  type: string
  method: string
  mode: string
  userIdentify?: string;
  keywordTranslate: string
}

export interface CallbackType {
  (data: any): void
}

export interface ShardsStatus {
  shardId: number
  ready: boolean
  ms: number
  guilds: APIGuildObject[]
  guildsCount: number
  emojisCount: number
  channelsCount: number
  usersCount: number
  clusterName: string
  socketId?: string
}

export interface GuildsThroughShards {
  name: string
  id: string
}

export interface GetAndDeleteCacheType {
  id: string | undefined
  type: "user" | "guild" | "client" | "ranking" | undefined
}

export interface GetMultiplecacheDataType {
  ids: string[] | undefined
  type: "user" | "guild" | "ranking" | undefined
}

export interface RefreshCache {
  id: string | undefined
  type: "user" | "guild" | undefined
  data: UserSchemaType | GuildSchemaType
}

export interface AfkGlobalData {
  userId: string | undefined
  message: string | undefined
  method: "save" | "delete" | undefined
}
export interface commandApi {
  name: string,
  description: string
  category: string
  aliases: string[] | undefined
  tags: string[]
  synonyms: string[]
  perms: {
    user: string[]
    bot: string[]
  }
}

export interface GiveawayResponseData {
  guild: {
    id: string
    name: string
    roles: APIRole[]
    members: { username: string, id: string }[]
  }
  giveaway: {
    MessageID: string
    GuildId: string
    Prize: string
    Winners: number
    WinnersGiveaway: string[]
    Participants: string[]
    Emoji: string
    TimeMs: number
    DateNow: number
    ChannelId: string
    Actived: boolean
    MessageLink: string
    CreatedBy: string
    Sponsor: string | null
    AllowedRoles: string[]
    LockedRoles: string[]
    AllowedMembers: string[]
    LockedMembers: string[]
    RequiredAllRoles: boolean
    AddRoles: string[]
    MinAccountDays: number
    MinInServerDays: number
    DischargeDate: number
  }
}

export interface DiscordTokensBody {
  userId: string
  tokens: {
    access_token: string
    refresh_token: string
    expires_at: number
  }
}

export interface ChatMessage {
  id: string
  date: number
  avatar: string
  name: string
  message: string
}

export interface APIGuildObject {
  id: string
  name: string
  icon: string | null
  owner: boolean
  permissions: bigint | string
  features: string[]
}