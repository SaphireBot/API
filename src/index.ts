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
import { apiCommandsData, baseData, interactions, shardsAndSockets } from "./websocket/connection";
import { GiveawayResponseData } from "./@types";

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
server.get("/home", (_, res) => {
    return res.send({
        guilds: Object.values(baseData.guilds).reduce((pre, cur) => pre += cur, 0),
        commands: baseData.commands(),
        interactions: interactions.count
    })
});
server.get("/commandsdata", (_, res) => res.send(apiCommandsData.toJSON()));

server.get("/users/:CreatedBy/:Sponsor", async (req, res) => {

    const { CreatedBy, Sponsor } = req.params

    const data = {
        CreatedBy: {},
        Sponsor: {}
    }

    await fetch(`https://discord.com/api/users/${CreatedBy}`, {
        method: "GET",
        headers: {
            authorization: `Bot ${env.DISCORD_TOKEN}`,
        }
    })
        .then(data => data.json())
        .then(user => data.CreatedBy = user)
        .catch(() => ({ username: null }))

    await fetch(`https://discord.com/api/users/${Sponsor}`, {
        method: "GET",
        headers: {
            authorization: `Bot ${env.DISCORD_TOKEN}`,
        }
    })
        .then(data => data.json())
        .then(user => data.Sponsor = user)
        .catch(() => ({ username: null }))

    return res.send(data)
})

server.get("/giveaway/:guildId/:giveawayId", async (req, res) => {

    const { giveawayId, guildId } = req.params

    if (!giveawayId || !guildId) return res.status(400).send({ message: "O ID do servidor ou do Sorteio não foram definidos corretamente." })
    const timeout = setTimeout(() => res.status(404).send({ message: "O Discord demorou demais para entregar os participantes do sorteio." }), 1000 * 10)
    const size = shardsAndSockets.size
    let responses = 0

    for (const socket of shardsAndSockets.values())
        socket
            .timeout(7000)
            .emitWithAck("getGuildAndGiveaway", { guildId, giveawayId })
            .then((data: GiveawayResponseData) => {
                responses++

                if (!data) {
                    if (size == responses) {
                        clearTimeout(timeout)
                        console.log(data)
                        return res.status(404).send({ message: "Infelizmente, o sorteio não foi encontrado.", data })
                    }
                    return
                }

                const { giveaway, guild } = data

                if (!giveaway || !guild) {
                    clearTimeout(timeout)
                    return res.status(404).send({ message: "Os dados deste sorteio foram entregues, porém, incompletos.", data })
                }

                if (giveaway && guild) {
                    clearTimeout(timeout)
                    return res.send(data)
                }
            })
            .catch(() => null)

    // for (const socket of shardsAndSockets.values())
    //     socket
    //         .timeout(7000)
    //         .emitWithAck("getGuildAndGiveaway", { giveawayId })
    //         .then(sendResponse)
    //         .catch(() => null)

    // return
    // function sendResponse(stringifiedData: string) {
    //     if (!stringifiedData) {
    //         responses++
    //         if (responses == size) {
    //             clearTimeout(timeout)
    //             res.status(404).send({ message: "Este sorteio não existe ou foi deletado." })
    //         }
    //         return
    //     }

    //     clearTimeout(timeout)
    //     const data = JSON.parse(stringifiedData)
    //     return res.status(200).send(data)
    // }

})

httpServer.listen(
    env.SERVER_PORT,
    "0.0.0.0",
    (): void => {
        listen();
        update();
        return console.log("API Connected")
    }
)