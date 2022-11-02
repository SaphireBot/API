import "dotenv/config";
import "./services";
import "./webhooks";
import "./routes"
import server from "./server";
import dataJSON from "./json/data.json";
import sender from "./webhooks/sender";
import { CallbackError, connect } from "mongoose";
import { env } from "node:process";

server.get("/", (_, res) => res.status(200).send({ status: "Saphire's API Online" }));
server.get("/connections", (_, res) => res.send(dataJSON.urls.discordPrincipalServer));

server.listen({
  port: 8080,
  host: "0.0.0.0"
}, async (err, address): Promise<void> => {

  if (err)
    return console.log("AQUI", err, address);

  return connect(<string>env.DB_LOGIN,
    async function logger(error: CallbackError | null) {

      const databaseResponse = error
        ? `Houve um erro ao me conectar com o banco de dados!\nError: ${error}`
        : "Conexão efetuada com sucesso!"

      await sender({
        url: <string>env.WEBHOOK_STATUS,
        username: "[API] Connection Status",
        content: `${dataJSON.emojis.check} | API conectada com sucesso.\n${dataJSON.emojis.database} | ${databaseResponse}\n📅 | ${new Date().toLocaleString("pt-BR").replace(" ", " ás ")}`
      }).catch(() => null);

      return console.log(`Saphire's API Connected\n${databaseResponse}`);
    });
});