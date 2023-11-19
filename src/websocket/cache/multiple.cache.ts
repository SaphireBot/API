import { CallbackType } from "../../@types";
import database from "../../database";
import { mGet, ranking, set } from "./get.cache";

export default async (ids: string[] | undefined, type: "user" | "guild" | "ranking" | undefined, callback: CallbackType) => {
    if (!ids?.length || !type) return callback([])

    if (type === "ranking")
        return callback(ranking.getMany(ids).toJSON());

    let cache = await mGet(ids);

    if (!cache?.length) {
        cache = type === "user"
            ? await database.User.find({ id: { $in: ids } })
            : await database.Guild.find({ id: { $in: ids } })

        for (const doc of cache) set(doc?.id, doc);
    }

    return callback(cache)
}