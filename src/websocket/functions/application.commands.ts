import { env } from "process"
import { Rest } from "../../index"
import { Routes } from "discord.js"
import { applicationCommands } from "../connection"
import { APIApplicationCommand } from "discord.js"

export default async () => {
    const commands = await Rest.get(Routes.applicationCommands(env.SAPHIRE_ID))?.catch(() => []) as APIApplicationCommand[]
    console.log(`${commands.length} Application Commands Data Cached`)
    for (const cmd of commands) applicationCommands.set(cmd?.name, cmd)
}