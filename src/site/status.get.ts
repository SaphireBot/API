import mongoose from "mongoose"
import { shardsAndSockets } from "../websocket/connection"
import { Request, Response } from "express"

export default async (_: Request, res: Response) => {

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
}