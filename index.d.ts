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
      WEBSOCKET_TWITCH_API_LOGIN_URL: string
      TWITCH_API_URL: string
      GUILDS_ACCESS: string
      PHRASES_ACCESS: string
      POST_MESSAGE: string
      ROUTE_TOP_GG: string
      ROUTE_SAPHIRE_TOP_GG: string
      ROUTE_SAPHIRE_COMMANDS: string
      ROUTE_SAPHIRE_GUILDS: string
      WEBHOOK_TOP_GG_COUNTER: string
      WEBHOOK_STATUS: string
      WEBHOOK_ANIME_SUPPORTER: string
      TOP_GG_WEBHOOK_AVATAR: string
      DB_LOGIN: string
      DB_CREDENTIALS: string
      CLIENT_ID: string
      CLIENT_SECRET: string
      SERVER_PORT: string
      APP_ID: string
      TENOR_API_KEY: string
      TENOR_CLIENT_KEY: string
      DISCLOUD_TOKEN: string
      DISCLOUD_APP_ID: string
      LOGIN_ACCESS: string
      WEBSOCKET_CONNECTION_AUTHORIZATION: string
      WEBSOCKET_URL: string
      SAPHIRE_ID: string
      SAPHIRE_DISCORD_TOKEN: string
      SAPHIRE_DATABASE_LINK_CONNECTION: string
      CANARY_DISCORD_TOKEN: string
      CANARY_DATABASE_LINK_CONNECTION: string
      DATABASE_BET_LINK_CONNECTION: string
      DATABASE_RECORD_LINK_CONNECTION: string
      CANARY_ID: string
      MACHINE: "localhost" | "discloud"
      CLIENT_SECRET: string
      CANARY_SECRET: string
      COOKIE_SECRET: string
      BOT_TOKEN_REQUEST: string
      STATCORD_TOKEN: string
      TOP_GG_TOKEN: string
      TOP_GG_ACCESS: string
      MERCADO_PAGO_TOKEN: string
      GET_DATA_AUTHORIZATION: string
      COMMAND_ACCESS: string
      COMMIT_AUTHORIZATION: string
      GET_BACKUP_ZIP: string
      CHAT_GPT_KEY: string
      GERENCIA_NET_PRODUCTION_CLIENT_ID: string
      GERENCIA_NET_PRODUCTION_CLIENT_SECRET: string
      GERENCIA_NET_HOMOLOGATION_CLIENT_ID: string
      GERENCIA_NET_HOMOLOGATION_CLIENT_SECRET: string
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
      ROUTE_TOP_GG: string
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
      YOUTUBE_API_KEY_1: string
      YOUTUBE_API_KEY_2: string
      YOUTUBE_API_KEY_3: string
      YOUTUBE_API_KEY_4: string
      YOUTUBE_API_KEY_5: string
      YOUTUBE_API_KEY_6: string
      YOUTUBE_API_KEY_7: string
      YOUTUBE_API_KEY_8: string
      YOUTUBE_API_KEY_9: string
      YOUTUBE_API_KEY_10: string
      YOUTUBE_API_KEY_11: string
      YOUTUBE_API_KEY_12: string
      YOUTUBE_API_KEY_13: string
      YOUTUBE_API_KEY_14: string
      YOUTUBE_API_KEY_15: string
      YOUTUBE_API_KEY_16: string
      YOUTUBE_API_KEY_17: string
      YOUTUBE_API_KEY_18: string
      YOUTUBE_API_KEY_19: string
      YOUTUBE_API_KEY_20: string
      YOUTUBE_CLIENT_ID: string
      YOUTUBE_CLIENT_SECRET_ID: string
      GEMINI_API_KEY: string
      // REDIS_USER_PASSWORD: string
      // REDIS_SOCKET_HOST_URL: string
      // REDIS_SOCKET_HOST_PORT: string
      REDIS_RANKING_PASSWORD: string
      REDIS_RANKING_HOST_URL: string
      REDIS_RANKING_HOST_PORT: string
      // REDIS_USER_CACHE_PASSWORD: string
      // REDIS_USER_CACHE_HOST_URL: string
      // REDIS_USER_CACHE_HOST_PORT: string
      APPLICATION_COMMANDS_PASSWORD: string
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