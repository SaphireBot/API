import { CallbackType } from "../../@types";
import database from "../../database";
import { ranking } from "./get.cache";

export default async (ids: string[] | undefined, type: "user" | "guild" | "ranking" | undefined, callback: CallbackType) => {
    if (!ids?.length || !type) return callback([])

    if (type === "ranking")
        return callback(ranking.getMany(ids).toJSON());

    const data = type === "user"
        ? await database.User.find({ id: { $in: ids } })
        : await database.Guild.find({ id: { $in: ids } })

    return callback(data)
}