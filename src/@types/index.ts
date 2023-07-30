import { APIAttachment, APIEmbed, Attachment, AttachmentBuilder, AttachmentPayload, BufferResolvable, JSONEncodable, MessageComponent, MessageReference, APIRole } from "discord.js";
import { Stream } from "node:stream";
import { Response as UndiciResponse } from "undici"
import { DocumentSetOptions } from "mongoose";
import { Request, Response } from "express"
import { Socket } from "socket.io";

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
  content: string | null
  message_reference: MessageReference | null
  method: string | null
  channelId: string | null
  messageId?: string | null
  components: MessageComponent[] | []
  embeds: APIEmbed[] | []
  tts: boolean
}

export interface MessageToSendThroughWebsocket {
  method: "post" | "patch" | "delete" | undefined
  type: string | undefined
  channelId: string | undefined
  messageId?: string | undefined
  body?: MessageSaphireRequest
  authorization: string
  isWebsocket: boolean
  isTwitchNotification: boolean | undefined
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

export interface ResponseGetIp extends UndiciResponse {
  ip: string
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
  type: "registerCommand" | "addInteraction" | "getCommands" | "addMessage" | "getSaphireData" | "apiCommandsData" | "logged" | undefined
  message: string | undefined
  shardId: number | undefined
  commandName: string | undefined
  listener: string | undefined
  guilds: number | undefined
  guildsId: string[] | undefined
  commandsApi: commandApi[]
}

export interface CallbackType {
  (data: any): void
}

export interface ShardsStatus {
  shardId: number
  ready: boolean
  ms: number
  guilds: GuildsThroughShards[]
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
  type: "user" | "guild" | undefined
}

export interface GetMultiplecacheDataType {
  ids: string[] | undefined
  type: "user" | "guild" | undefined
}

export interface RefreshCache {
  id: string | undefined
  type: "user" | "guild" | undefined
  data: UserDatabase | GuildDatabase
}

export interface UserDatabase {
  id: string,
  Likes: number,
  // {
  //     access_token: string,
  //     refresh_token: tokens.refresh_token,
  //     expires_at: Date.now() + tokens.expires_in * 1000,
  // }
  Tokens: Record<string, any>,
  Xp: number,
  Level: number,
  Transactions: Record<string, any>[],
  Balance: number,
  AfkSystem: string,
  DailyCount: number,
  MixCount: number,
  QuizCount: number,
  TicTacToeCount: number,
  CompetitiveMemoryCount: number,
  ForcaCount: number,
  GamingCount: {
    FlagCount: number,
    AnimeThemeCount: number,
    QuizAnime: number,
    Logomarca: number,
    QuizQuestions: number
  },
  Timeouts: {
    Bug: number,
    Daily: number,
    ImagesCooldown: number,
    Loteria: number,
    Cantada: number,
    Bitcoin: number,
    Porquinho: number,
    TopGGVote: number,
    Rep: number
  },
  Cache: { ComprovanteOpen: boolean },
  Color: {
    Perm: boolean,
    Set: string
  },
  Perfil: {
    Titulo: string,
    Status: string,
    Sexo: string,
    Signo: string,
    Aniversario: string,
    Trabalho: string,
    BalanceOcult: boolean,
    Marry: {
      Conjugate: string,
      StartAt: number
    },
    Bits: number,
    Bitcoins: number,
    Estrela: {
      Um: boolean,
      Dois: boolean,
      Tres: boolean,
      Quatro: boolean,
      Cinco: boolean,
      Seis: boolean,
    }
  },
  Vip: {
    DateNow: number,
    TimeRemaing: number,
    Permanent: boolean
  },
  Walls: {
    Bg: string[],
    Set: string
  },
  Jokempo: {
    Wins: number,
    Loses: number
  }
}

export interface GuildDatabase {
  id: string
  Giveaways: Record<string, any>[]
  TempCall: {
    enable: boolean
    muteTime: boolean
    members: any
    membersMuted: any
  },
  Spam: {
    enabled: boolean,
    ignoreChannels: string[]
    ignoreRoles: string[]
    filters: {
      capsLock: {
        enabled: boolean,
        percent: number
      },
      messagesTimer: {
        enabled: boolean
        amount: number
        seconds: number
      },
      repeat: {
        enabled: boolean
      }
    }
  },
  Chest: boolean
  Polls: Record<string, any>[]
  Moeda: string
  FirstSystem: boolean
  Autorole: any[],
  CommandBlocks: any[]
  TwitchNotifications: Record<string, any>[]
  MinDay: {
    days: number
    punishment: string
  },
  announce: {
    channel: string
    allowedRole: string
    notificationRole: string
    crosspost: boolean
  },
  LogSystem: {
    channel: string
    webhookUrl: string
    ban: {
      active: boolean
    },
    unban: {
      active: boolean
    },
    kick: {
      active: boolean
    },
    mute: {
      active: boolean
    },
    channels: {
      active: boolean
    },
    messages: {
      active: boolean
    },
    botAdd: {
      active: boolean
    },
    roles: {
      active: boolean
    }
  },
  XpSystem: {
    Canal: string
    Mensagem: string
  },
  LeaveChannel: {
    channelId: string
    body: Record<string, any>[]
  },
  WelcomeChannel: {
    channelId: string
    body: Record<string, any>[]
  },
  Stars: {
    limit: number
    channel: string
    sended: Record<string, any>[]
  }
}

export interface AfkGlobalData {
  userId: string | undefined
  message: string | undefined
  method: "save" | "delete" | undefined
}

export interface SiteStaffs {
  id: string
  username: string
  avatarUrl: string | null
  tags: string[]
  social: {
    instagram: string | null
    github: string | null
    discord: string
  }
  description: string | null
}

export interface commandApi {
  name: string,
  description: string,
  category: string,
  synonyms: string[],
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
		members:  { username: string, id: string }[]
	},
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