process.env.TZ = "America/Sao_Paulo";
import "./prototypes/Collection";
import "dotenv/config";
import "./webhooks";
import "./services/message/message.post";
import "./websocket";
import "./site"
import "./load";
import "./mercadopago"
import { server, httpServer } from "./server";
import { env } from "process";
import { REST } from "discord.js";
import sender from "./webhooks/sender";
import { emojis } from "./json/data.json";
import * as ApplicationCommands from "./bot/application_commands";
export const Rest = new REST().setToken(env.DISCORD_TOKEN);
ApplicationCommands.loadApplicationCommands();

server.get("/", (_, res) => res.status(200).send({ status: "Welcome to Saphire's API" }));
server.get("/ping", (_, res) => res.status(200).send("Saphire's API PING"));

httpServer.listen(8080 || Number(env.SERVER_PORT), "0.0.0.0", () => {
    sender({
        url: env.WEBHOOK_STATUS,
        username: "[API] Connection Status",
        content: `${emojis.check} | API conectada com sucesso.\n📅 | ${new Date().toLocaleString("pt-BR").replace(" ", " ás ")}`,
        avatarURL: env.WEBHOOK_GSN_AVATAR
    }).catch(() => null);
});
