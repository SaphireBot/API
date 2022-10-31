import "dotenv/config";
import "./services";
import "./webhooks";
import server from "./server";
import dataJSON from "./json/data.json";
import sender from "./webhooks/sender";
import { env } from "node:process";

server.get("/", (_, res) => res.status(200).send({ status: "Saphire's API Online" }));
server.get("/connections", (_, res) => res.send(dataJSON.urls.discordPrincipalServer));

server.listen({
  port: 8080,
  host: "0.0.0.0"
}, async (err, address): Promise<void> => {

  if (err)
    return console.log(err, address);

  await sender({
    url: env.WEBHOOK_STATUS!,
    username: "[API] Connection Status",
    content: `${dataJSON.emojis.check} | API conectada com sucesso.\n📅 | ${new Date().toLocaleString("pt-BR").replace(" ", " ás ")}`
  }).catch(() => null);

  return console.log("Saphire's API Connected");

});