process.env.TZ = "America/Sao_Paulo"
import "dotenv/config";
import "./services";
import "./webhooks";
import "./routes"
import server from "./server";
import dataJSON from "./json/data.json";
import listen from "./webhooks/listen"
import { env } from "node:process"

server.get("/", (_, res) => res.status(200).send({ status: "Saphire's API Online" }));
server.get("/connections", (_, res) => res.send(dataJSON.urls.discordPrincipalServer));
server.get("/ping", (_, res) => res.status(200).send("Saphire's API PING"))

server.listen({ port: Number(env.SERVER_PORT), host: "0.0.0.0" }, listen);