import sender from "./sender";
import { CallbackError, connect, set } from "mongoose"
import { env } from "node:process";
import dataJSON from "../json/data.json";

export default async (err: Error | null, address: string): Promise<void> => {

    if (err)
        return errorAtEnableListen(err, address);

    set("strictQuery", true)

    return connect(env.DB_LOGIN,
        async function logger(error: CallbackError | null) {
            
            const databaseResponse = error
                ? `Houve um erro ao me conectar com o banco de dados!\nError: ${error}`
                : "Conexão efetuada com sucesso!"

            await sender({
                url: env.WEBHOOK_STATUS,
                username: "[API] Connection Status",
                content: `${dataJSON.emojis.check} | API conectada com sucesso.\n${dataJSON.emojis.database} | ${databaseResponse}\n📅 | ${new Date().toLocaleString("pt-BR").replace(" ", " ás ")}`,
                avatarURL: env.WEBHOOK_GSN_AVATAR
            }).catch(() => null);

            return console.log(`Saphire's API Connected\n${databaseResponse}`);
        });
}

async function errorAtEnableListen(err: Error | null, address: string): Promise<void> {

    await sender({
        url: env.WEBHOOK_STATUS,
        username: "[API] Connection Status | FAILED",
        embeds: [{
            color: 0xff0000, // RED
            title: `Error to listen at port ${Number(env.SERVER_PORT)}`,
            description: `\`\`\`\n${err}\n\`\`\``.slice(0, 4000),
            fields: [{
                name: "📨 Rota",
                value: address
            }]
        }]
    }).catch(() => null);
    return;
}