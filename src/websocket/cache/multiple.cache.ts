import { CallbackType } from "../../@types";
import { users, guilds, ranking } from "./get.cache";

export default (ids: string[] | undefined, type: "user" | "guild" | "ranking" | undefined, callback: CallbackType): void => {
    if (!ids?.length || !type) return callback([])

    const cache = type === "ranking"
        ? ranking
        : type === "user"
            ? users
            : guilds

    return callback(cache.getMany(ids).toJSON())
}