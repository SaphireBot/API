import { shards } from "../websocket/connection"
import { Request, Response } from "express"
import { SaphireMongooseCluster, BetMongooseCluster, RecordMongooseCluster } from "../load"
import { env } from "process"

export default async (_: Request, res: Response) => {

    const now = Date.now();
    const calculate = () => Date.now() - now;
    const ms: any = [];
    const discordToken = env.MACHINE === "localhost" ? env.CANARY_DISCORD_TOKEN : env.SAPHIRE_DISCORD_TOKEN;

    await Promise.all([
        fetch("https://api.discloud.app/v2/user", { headers: { accept: "*/*", "api-token": process.env.DISCLOUD_TOKEN } }).then(() => ms.push({ name: "discloud", ms: calculate() })).catch(() => ms.push({ name: "discloud", ms: 0 })),
        fetch("https://discord.com/api/v10/users/@me", { method: "GET", headers: { authorization: discordToken } }).then(() => ms.push({ name: "discord", ms: calculate() })).catch(() => ms.push({ name: "discord", ms: 0 })),
        fetch("https://top.gg/api/bots/912509487984812043", { headers: { authorization: process.env.TOP_GG_TOKEN }, method: "GET" }).then(() => ms.push({ name: "topgg", ms: calculate() })).catch(() => ms.push({ name: "topgg", ms: 0 })),
        SaphireMongooseCluster.db?.admin()?.ping().then(() => ms.push({ name: "database1", ms: calculate() })).catch(() => ms.push({ name: "database1", ms: 0 })),
        BetMongooseCluster.db?.admin()?.ping().then(() => ms.push({ name: "database2", ms: calculate() })).catch(() => ms.push({ name: "database2", ms: 0 })),
        RecordMongooseCluster.db?.admin()?.ping().then(() => ms.push({ name: "database3", ms: calculate() })).catch(() => ms.push({ name: "database3", ms: 0 })),
        ms.push({ name: "rediscache", ms: 0 }),
        ms.push({ name: "redisranking", ms: 0 }),
        ms.push({ name: "redisuser", ms: 0 })
    ]);

    ms.push(
        {
            name: "shards",
            data: shards
                .sort((a, b) => a.shardId - b.shardId)
                .map((data, shardId) => ({ shard: shardId, ms: data?.ms || 0, guilds: data.guildsCount || 0 }))
        }
    );

    return res.send(ms);
}