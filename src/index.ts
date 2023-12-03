process.env.TZ = "America/Sao_Paulo";
import "./prototypes/Collection";
import "dotenv/config";
import "./webhooks";
import "./services/message/message.post";
import "./websocket";
import "./site"
import load from "./load";
import { server, httpServer } from "./server";
import { env } from "process";
import { REST } from "discord.js";
export const Rest = new REST().setToken(env.DISCORD_TOKEN);

server.get("/", (_, res) => res.status(200).send({ status: "Welcome to Saphire's API" }));
server.get("/ping", (_, res) => res.status(200).send("Saphire's API PING"));

httpServer.listen(Number(env.SERVER_PORT), "0.0.0.0", load);