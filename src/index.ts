process.env.TZ = "America/Sao_Paulo";
import "dotenv/config";
import "./services";
import "./webhooks";
import "./routes";
import "./websocket";
import dataJSON from "./json/data.json";
import listen from "./webhooks/listen"
import { server, httpServer } from "./server";
import { env } from "process";
import { allGuilds, apiCommandsData, interactions } from "./websocket/connection";
import bugs from "./site/bugs";
import databaseInfo from "./site/user.database";
import userGet from "./site/user.get";
import giveawayGet from "./site/giveaway.get";
import topggPost from "./site/topgg.post";
import tokensSet from "./site/tokens.set";
import clientGet from "./site/client.get";
import statusGet from "./site/status.get";
import usersGet from "./site/users.get";
import commandsdata from "./site/commandsdata";

server.get("/", (_, res) => res.status(200).send({ status: "Saphire's API Online" }));
server.get("/connections", (_, res) => res.send(dataJSON.urls.discordPrincipalServer));
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
server.get("/home", (_, res) => res.send({ guilds: allGuilds.size, commands: apiCommandsData.size, interactions: interactions.count }));
server.get("/commandsdata", commandsdata);
server.get("/servers", (_, res) => res.send(Array.from(new Set(allGuilds.keys()))));

// Site Area
server.get("/users/:CreatedBy/:Sponsor", usersGet);
server.get("/user/:userId/:field", databaseInfo);
server.get("/user/:userId", userGet);
server.get("/giveaway/:guildId/:giveawayId", giveawayGet);
server.post("/topgg", topggPost);
server.post("/discordtokens", tokensSet);
server.get("/clientdata", clientGet);
server.get("/status", statusGet);
server.post("/bugs", bugs);

httpServer.listen(env.SERVER_PORT, "0.0.0.0", listen);