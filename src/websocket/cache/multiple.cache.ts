import { CallbackType } from "../../@types";
import database, { redis } from "../../database";
import { ranking, set } from "./get.cache";

export default async (ids: string[] | undefined, type: "user" | "guild" | "ranking" | undefined, callback: CallbackType) => {
    if (!ids?.length || !type) return callback([])

    if (type === "ranking")
        return callback(ranking.getMany(ids).toJSON());

    let cache = await redis.json.mGet(ids, "$") as any[];

    if (!cache?.length) {
        cache = type === "user"
            ? await database.User.find({ id: { $in: ids } })
            : await database.Guild.find({ id: { $in: ids } })

        for (const d of cache) set(d?.id, d);
    }

    return callback(cache)
}