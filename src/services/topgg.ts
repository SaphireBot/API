import { Webhook } from "@top-gg/sdk";
import { env } from "process";

export const topggWebhook = new Webhook(env.TOP_GG_TOKEN);