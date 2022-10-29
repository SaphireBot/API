import { Dispatcher } from "undici"

declare namespace NodeJS {
  interface ProcessEnv {
    TOP_GG_AUTHORIZATION?: string
    TOP_GG_TOKEN?: string,
    ROUTE_TOP_GG?: string,
    WEBHOOK_ACCESS?: string,
    WEBHOOK_TOP_GG_COUNTER?: string,
    TOP_GG_WEBHOOK_AVATAR?: string,
    SAPHIRE_ROUTE_TOP_GG?: string
  }
}

declare namespace Dispatcher {
  interface ResponseData {
    content?: string
  }

}