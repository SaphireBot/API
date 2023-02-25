process.env.TZ = "America/Sao_Paulo"
import "dotenv/config";
import "./services";
import "./webhooks";
import "./routes"
import { server, wss, httpServer } from "./server";
import dataJSON from "./json/data.json";
import listen from "./webhooks/listen"
import { env } from "process";

server.get("/", (_, res) => res.status(200).send({ status: "Saphire's API Online" }));
server.get("/connections", (_, res) => res.send(dataJSON.urls.discordPrincipalServer));
server.get("/ping", (_, res) => res.status(200).send("Saphire's API PING"))

wss.once("listening", () => console.log("Websocket System Started"))

wss.on("connection", (socket) => {

    socket.on("error", console.error);

    socket.send("Conectado com sucesso na Websocket")
});

wss.on("error", error => console.log(error))

httpServer.listen(env.SERVER_PORT, "0.0.0.0", () => listen())