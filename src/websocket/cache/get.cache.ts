import { Collection } from "discord.js";
import { CallbackType } from "../../@types";
import { GuildSchema } from "../../database/model/guilds";
import { UserSchema } from "../../database/model/user";
import database from "../../database";
import { ClientSchema } from "../../database/model/client";
export const users = new Collection<string, UserSchema>();
export const guilds = new Collection<string, GuildSchema>();
export const client = new Collection<string, ClientSchema>();

export default async (id: string | undefined, type: "user" | "guild" | "client" | undefined, callback: CallbackType): Promise<void> => {

    if (!id || !type) return callback(null)

    if (type == "guild") {
        const data = guilds.get(id)
        if (data) return callback(data)

        const guildData = await database.Guild.findOne({ id }).then(doc => doc?.toObject())
        if (guildData) guilds.set(id, guildData)

        return callback(guildData)
    }

    if (type == "user") {
        const data = users.get(id)
        if (data) return callback(data)

        const userData = await database.User.findOne({ id }).then(doc => doc?.toObject())
        if (userData) users.set(id, userData)

        return callback(userData)
    }

    if (type == "client") {
        const data = client.get(id)
        if (data) return callback(data)

        const clientData = await database.Client.findOne({ id }).then(doc => doc?.toObject())
        if (clientData) client.set(id, clientData);

        return callback(clientData)
    }

    return callback(null)
}