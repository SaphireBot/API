import { Dispatcher } from "undici"

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TOP_GG_AUTHORIZATION: string
      TOP_GG_TOKEN: string
      WEBHOOK_ACCESS: string
      GET_COMMANDS_ACCESS: string
      COMMAND_ACCESS: string
      GUILDS_ACCESS: string
      PHRASES_ACCESS: string
      CONNECTION_URL: string
      ROUTE_TOP_GG: string
      ROUTE_SAPHIRE_TOP_GG: string
      ROUTE_SAPHIRE_COMMANDS: string
      ROUTE_SAPHIRE_GUILDS: string
      WEBHOOK_TOP_GG_COUNTER: string
      WEBHOOK_STATUS: string
      TOP_GG_WEBHOOK_AVATAR: string
      DB_LOGIN: string
      DB_CREDENTIALS: string
      AUTH_LOGIN_LINK: string
      CLIENT_ID: string
      CLIENT_SECRET: string
      SERVER_PORT: number
      APP_ID: string
      SQUARE_API_TOKEN: string
      DISCLOUD_TOKEN: string
      DISCLOUD_APP_ID: string
      COMMIT_AUTHORIZATION: string
      SAPHIRE_ID: string
      SAPHIRE_BOT_ID: string
      SAPHIRE_API_ID: string
    }
  }
}

declare namespace Dispatcher {
  interface ResponseData {
    content?: string
  }

}