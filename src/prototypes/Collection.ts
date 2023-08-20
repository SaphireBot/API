import { Collection } from "discord.js";

Collection.prototype.getMany = function (keys) {

    const col = new Collection()

    if (!keys?.length) return col

    for (const k of keys)
        col.set(k, this.get(k))

    return col
}