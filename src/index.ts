process.env.TZ = "America/Sao_Paulo";
import "./prototypes/Collection";
import "dotenv/config";
import "./services";
import "./webhooks";
import "./routes";
import "./websocket";
import "./site"
import listen from "./webhooks/listen";
import { server, httpServer } from "./server";
import { env } from "process";
import { REST } from "discord.js";
import { allGuilds, interactions } from "./websocket/connection";
export const Rest = new REST().setToken(env.DISCORD_TOKEN);

server.get("/", (_, res) => res.status(200).send({ status: "Welcome to Saphire's API" }));
server.get("/ping", (_, res) => res.status(200).send("Saphire's API PING"));
server.get("/commandscount", (req, res) => {

    if (req.headers?.authorization !== env.GET_COMMANDS_ACCESS)
        return res.sendStatus(401) // Unauthorized

    return res.send({
        commands: interactions.commands
            .map((value, key) => ({ [key]: value || 0 })),
        interactions: interactions.count,
        messages: interactions.message
    })

});
server.get("/guilds", (_, res) => res.send(allGuilds.toJSON()))

httpServer.listen(Number(env.SERVER_PORT), "0.0.0.0", listen);