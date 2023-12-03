import { CallbackError, connect, set } from "mongoose";
import { env } from "node:process";
import dataJSON from "./json/data.json";
import { refreshPartnersStatus, shardsAndSockets } from "./websocket/connection";
import applicationCommands from "./websocket/functions/application.commands";
import Blacklist from "./blacklist/manager"
import database from "./database";
import sender from "./webhooks/sender";

export default async (err?: Error | null, address?: string): Promise<void> => {
    console.log("API Online")

    if (err)
        return errorAtEnableListen(err, address);

    set("strictQuery", true)

    connect(env.DATABASE_LINK_CONNECTION)
        .then(() => {
            console.log("Mongoose Database - Connected");
            database.watch();
            shardsAndSockets.random()?.send({ type: "sendStaffData" });
            applicationCommands();
            Blacklist.load();
            refreshPartnersStatus();
            sender({
                url: env.WEBHOOK_STATUS,
                username: "[API] Connection Status",
                content: `${dataJSON.emojis.check} | API conectada com sucesso.\n${dataJSON.emojis.database} | Conexão efetuada com sucesso!\n📅 | ${new Date().toLocaleString("pt-BR").replace(" ", " ás ")}`,
                avatarURL: env.WEBHOOK_GSN_AVATAR
            }).catch(() => null);
        })
        .catch((error: CallbackError | null): undefined => {

            const databaseResponse = error
                ? `Houve um erro ao me conectar com o banco de dados!\nError: ${error}`
                : "Conexão efetuada com sucesso!"

            sender({
                url: env.WEBHOOK_STATUS,
                username: "[API] Connection Status",
                content: `${dataJSON.emojis.check} | API conectada com sucesso.\n${dataJSON.emojis.database} | ${databaseResponse}\n📅 | ${new Date().toLocaleString("pt-BR").replace(" ", " ás ")}`,
                avatarURL: env.WEBHOOK_GSN_AVATAR
            }).catch(() => null);

            console.log(`Saphire's API\n${databaseResponse}`);
            return
        })

    return
}

async function errorAtEnableListen(err: Error | null, address?: string): Promise<void> {

    await sender({
        url: env.WEBHOOK_STATUS,
        username: "[API] Connection Status | FAILED",
        embeds: [{
            color: 0xff0000, // RED
            title: `Error to listen at port ${Number(env.SERVER_PORT)}`,
            description: `\`\`\`\n${err}\n\`\`\``.slice(0, 4000),
            fields: [{
                name: "📨 Rota",
                value: address || "Nenhum endereço encontrado"
            }]
        }]
    }).catch(() => null);
    return;
}