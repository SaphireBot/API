import "discord.js";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TOP_GG_AUTHORIZATION: string
      TOP_GG_TOKEN: string
      WEBHOOK_ACCESS: string
      GET_COMMANDS_ACCESS: string
      COMMAND_ACCESS: string
      WEBSOCKET_SAPHIRE_API_LOGIN_PASSWORD: string
      WEBSOCKET_SAPHIRE_API_LOGIN_URL: string
      GUILDS_ACCESS: string
      PHRASES_ACCESS: string
      POST_MESSAGE: string
      CONNECTION_URL: string
      SERVER_BUG_REPORT: string
      WEBHOOK_TOP_GG_COUNTER: string
      WEBHOOK_STATUS: string
      WEBHOOK_ANIME_SUPPORTER: string
      TOP_GG_WEBHOOK_AVATAR: string
      DB_LOGIN: string
      DB_CREDENTIALS: string
      AUTH_LOGIN_LINK: string
      CLIENT_ID: string
      CLIENT_SECRET: string
      SERVER_PORT: string
      APP_ID: string
      DISCLOUD_TOKEN: string
      DISCLOUD_APP_ID: string
      LOGIN_ACCESS: string
      WEBSOCKET_CONNECTION_AUTHORIZATION: string
      WEBSOCKET_URL: string
      DATABASE_BET_LINK_CONNECTION: string
      DATABASE_RECORD_LINK_CONNECTION: string
      SAPHIRE_BOT_ID: string
      DISCORD_TOKEN: string
      DATABASE_LINK_CONNECTION: string
      MACHINE: string
      CLIENT_SECRET: string
      CANARY_SECRET: string
      COOKIE_SECRET: string
      DISCLOUD_TOKEN: string
      STATCORD_TOKEN: string
      TOP_GG_TOKEN: string
      TOP_GG_ACCESS: string
      MERCADO_PAGO_TOKEN: string
      GET_DATA_AUTHORIZATION: string
      COMMAND_ACCESS: string
      ALL_GUILDS_ACCESS: string
      ALL_USERS_ACCESS: string
      COMMIT_AUTHORIZATION: string
      SAPHIRE_ID: string
      SAPHIRE_API_ID: string
      GET_BACKUP_ZIP: string
      CHAT_GPT_KEY: string
      LINKED_ROLES_AUTHORIZATION: string
      APPLICATION_COMMANDS_PASSWORD: string
      GERENCIA_NET_CLIENT_ID: string
      GERENCIA_NET_CLIENT_SECRET: string
      SPOTIFY_TOKEN: string
      SPOTIFY_CLIENT_ID: string
      SPOTIFY_CLIENT_SECRET: string
      DATABASE_PASSWORD_ACCESS: string
      DATABASE_USER_ACCESS: string
      WEBHOOK_SENDER_AUTHORIZATION: string
      WEBHOOK_DATABASE_LOGS: string
      WEBHOOK_ERROR_REPORTER: string
      WEBHOOK_DATABASE_PACKAGE: string
      WEBHOOK_ANIME_WALLPAPERS: string
      WEBHOOK_STATUS: string
      WEHBHOOK_SYSTEM_AVATAR: string
      WEBHOOK_GSN_AVATAR: string
      WEBHOOK_CANTADAS_URL: string
      ROUTE_BASE_DOMAIN: string
      ROUTE_GENERAL: string
      ROUTE_ALL_GUILDS: string
      ROUTE_ALL_USERS: string
      ROUTE_COMMANDS: string
      ROUTE_DATABASE: string
      ROUTE_RANKING: string
      ROUTE_WEBHOOK_SENDER: string
      ROUTE_LINKED_ROLES_CALLBACK: string
      ROUTE_LINKED_ROLES: string
      ROUTE_USERS_FROM_DATABASE: string
      ROUTE_GET_USERS_FROM_DATABASE_PASSWORD: string
      ROUTE_ANIMES_FROM_DATABASE: string
      ROUTE_CANTADAS_FROM_DATABASE: string
      ROUTE_CLIENTS_FROM_DATABASE: string
      ROUTE_ECONOMIES_FROM_DATABASE: string
      ROUTE_FANARTS_FROM_DATABASE: string
      ROUTE_GUILDS_FROM_DATABASE: string
      ROUTE_INDICATIONS_FROM_DATABASE: string
      ROUTE_MEMES_FROM_DATABASE: string
      ROUTE_RATHERS_FROM_DATABASE: string
      ROUTE_REMINDERS_FROM_DATABASE: string
      ROUTE_USERS_FROM_DATABASE: string
      ROUTE_GET_DATA_FROM_DATABASE_PASSWORD: string
      TWITCH_CLIENT_ID: string
      TWITCH_CLIENT_SECRET: string
      YOUTUBE_API_KEY: string
      BOT_USERS_TOKEN_REQUEST: string
      BOT_TOKEN_REQUEST: string
      REQUESTER1: string
      REDIS_USER_PASSWORD: string
      REDIS_SOCKET_HOST_URL: string
      REDIS_SOCKET_HOST_PORT: string
      REDIS_RANKING_PASSWORD: string
      REDIS_RANKING_HOST_URL: string
      REDIS_RANKING_HOST_PORT: string
      REDIS_USER_CACHE_PASSWORD: string
      REDIS_USER_CACHE_HOST_URL: string
      REDIS_USER_CACHE_HOST_PORT: string
      MERCADO_PAGO_TEST_PUBLIC_KEY: string
      MERCADO_PAGO_TEST_ACCESS_TOKEN: string
      MERCADO_PAGO_PRODUCTION_PUBLIC_KEY: string
      MERCADO_PAGO_PRODUCTION_ACCESS_TOKEN: string
      MERCADO_PAGO_PRODUCTION_CLIENT_ID: string
      MERCADO_PAGO_PRODUCTION_CLIENT_SECRET: string
    }
  }

}

declare module "discord.js" {
  interface Collection<K, V> {
    getMany: (keys: K[]) => Collection<K, V>
  }
}