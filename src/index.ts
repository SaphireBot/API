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
import { allGuilds, apiCommandsData, interactions, shardsAndSockets } from "./websocket/connection";
import { GiveawayResponseData, commandApi } from "./@types";
import mongoose from "mongoose";

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
        guilds: allGuilds.size,
        commands: apiCommandsData.size,
        interactions: interactions.count
    })
});
server.get("/commandsdata", async (_, res) => {

    if (!apiCommandsData.size) {
        shardsAndSockets
            .random()
            ?.timeout(1000)
            .emitWithAck("commands", "get")
            .then((cmds: commandApi[]) => {
                if (!cmds?.length) return
                for (const cmd of cmds)
                    apiCommandsData.set(cmd.name, cmd)

                return res.send(apiCommandsData.toJSON())
            })
            .catch(() => { })
        return
    }

    return res.send(apiCommandsData.toJSON())
});
server.get("/servers", (_, res) => res.send(Array.from(new Set(allGuilds.keys()))))

server.get("/users/:CreatedBy/:Sponsor", async (req, res) => {

    const { CreatedBy, Sponsor } = req.params

    const data = {
        CreatedBy: {},
        Sponsor: {}
    }

    await fetch(`https://discord.com/api/users/${CreatedBy}`, {
        method: "GET",
        headers: { authorization: `Bot ${env.DISCORD_TOKEN}` }
    })
        .then(data => data.json())
        .then(user => data.CreatedBy = user)
        .catch(() => ({ username: null }))

    await fetch(`https://discord.com/api/users/${Sponsor}`, {
        method: "GET",
        headers: {
            authorization: `Bot ${env.DISCORD_TOKEN}`
        }
    })
        .then(data => data.json())
        .then(user => data.Sponsor = user)
        .catch(() => ({ username: null }))

    return res.send(data)
})

server.get("/user/:userId/:field", (req, res) => {

    const { field, userId } = req.params

    if (!userId || !field)
        return res.status(400).send({ message: "Campo do banco de dados não informado. Exemplo: .../user/transactions" })

    if (!shardsAndSockets.size)
        return res.status(500).send({ message: "Nenhum socket está conectado com a Saphire BOT." })

    return shardsAndSockets
        .random()
        ?.timeout(5000)
        .emitWithAck("getDatabaseInfo", { field, userId })
        .then(data => {

            if (!data)
                return res
                    .status(404)
                    .send({ message: "Nenhuma informação foi encontrada." })

            if (data.message) return res.send(data)

            return res.send(data)
        })
        .catch(err => res.status(404).send({ message: "Erro ao obter os dados solicitados.", err: err?.message }))
})

server.get("/user/:userId", async (req, res) => {

    const { userId } = req.params
    const { name, data } = req.query

    if (!userId)
        return res.status(400).send({ message: "Campo do banco de dados não informado. Exemplo: .../user/transactions" })

    if (name == "true" || data == "true") {
        await fetch(
            `https://discord.com/api/v10/users/${userId}`,
            {
                headers: { authorization: `Bot ${env.BOT_TOKEN_REQUEST}` },
                method: "GET"
            }
        )
            .then(res => res.json())
            .then(data => {
                if (name) return res.send(data.username)
                if (data) return res.send(data)
            })
            .catch(() => res.send("No Name"))
        return
    }

    if (!shardsAndSockets.size)
        return res.status(500).send({ message: "Nenhum socket está conectado com a Saphire BOT." })

    return shardsAndSockets
        .random()
        ?.timeout(5000)
        .emitWithAck("getDatabaseInfo", { userId })
        .then(data => {

            if (!data)
                return res
                    .status(404)
                    .send({ message: "Nenhuma informação foi encontrada." })

            delete data.Tokens
            return res.send(data)
        })
        .catch(err => res.status(404).send({ message: "Erro ao obter os dados solicitados.", err: err?.message }))
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

})

server.post("/discordtokens", async (req, res) => {

    if (req.headers?.authorization !== env.LINKED_ROLES_AUTHORIZATION)
        return res.send({ message: "Nenhuma autorização foi definida." })

    const { tokens, userId, notResponse } = JSON.parse(req.headers.data as string)

    if (!tokens || !userId)
        return res.send({ message: "userId ou tokens não definidos." })

    return shardsAndSockets
        .random()
        ?.timeout(7000)
        .emitWithAck("setTokens", { userId, tokens })
        .then(data => {

            if (notResponse) return res.sendStatus(200)

            if (!data)
                return res
                    .send({ message: "Nenhuma resposta foi encontrada." })

            if (data.message)
                return res.send(data)

            return res.send(data)
        })
        .catch(err => res.status(500).send({ message: "Erro ao salvar os dados solicitados.", err: err?.message }))

})

server.post("/topgg", async (req, res) => {

    if (
        req.headers.authorization !== env.TOP_GG_AUTHORIZATION
        || !req.body.user
    )
        return res.sendStatus(200)

    const socket = shardsAndSockets.random()

    if (socket)
        socket.send({ type: "topgg", message: req.body?.user })

    return res.sendStatus(200)
})

server.get("/clientdata", async (_, res) => {

    const timeout = setTimeout(() => res.send(null), 5000)

    shardsAndSockets
        .random()
        ?.timeout(2000)
        .emitWithAck("clientData", "get")
        .then(data => {
            clearTimeout(timeout)
            delete data.SpotifyAccessToken
            delete data.TwitchAccessToken
            return res.send(data)
        })
        .catch(() => { })

})

server.get("/status", async (_, res) => {

    const now = Date.now()
    const calculate = () => Date.now() - now
    const ms: any = []

    await Promise.all([
        fetch("https://api.discloud.app/v2/user", { headers: { accept: "*/*", "api-token": process.env.DISCLOUD_TOKEN } }).then(() => ms.push({ name: "discloud", ms: calculate() })).catch(() => ms.push({ name: "discloud", ms: 0 })),
        fetch("https://discord.com/api/v10/users/@me", { method: "GET", headers: { authorization: process.env.DISCORD_TOKEN } }).then(() => ms.push({ name: "discord", ms: calculate() })).catch(() => ms.push({ name: "discord", ms: 0 })),
        fetch("https://top.gg/api/bots/912509487984812043", { headers: { authorization: process.env.TOP_GG_TOKEN }, method: "GET" }).then(() => ms.push({ name: "topgg", ms: calculate() })).catch(() => ms.push({ name: "topgg", ms: 0 })),
        mongoose.connection.db.admin().ping().then(() => ms.push({ name: "database", ms: calculate() })).catch(() => ms.push({ name: "database", ms: 0 })),
        shardsAndSockets?.random()?.timeout(7000).emitWithAck("shardsping", "get").then(data => ms.push({ name: "shards", data: data })).catch(() => ms.push({ name: "shards", data: [] }))
    ])

    return res.send(ms)
})

httpServer.listen(env.SERVER_PORT, "0.0.0.0", listen)