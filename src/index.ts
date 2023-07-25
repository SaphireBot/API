process.env.TZ = "America/Sao_Paulo";
import "dotenv/config";
import "./services";
import "./webhooks";
import "./routes";
import "./websocket";
import { server, httpServer } from "./server";
import dataJSON from "./json/data.json";
import listen from "./webhooks/listen"
import { env } from "process";
import update from "./services/update/index";
import { apiCommandsData, interactions } from "./websocket/connection";

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
server.get("/commandsdata", (_, res) => res.send(apiCommandsData.toJSON()));

httpServer.listen(
    env.SERVER_PORT,
    "0.0.0.0",
    (): void => {
        listen();
        update();
        return console.log("API Connected")
    }
)