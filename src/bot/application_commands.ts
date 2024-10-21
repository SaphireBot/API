import { ApplicationCommand, GuildResolvable } from "discord.js";
import { server } from "../server";
import { env } from "process";
type appCommand = ApplicationCommand<{ guild: GuildResolvable }>;
const commands = new Map<string, appCommand>();
let timeout: NodeJS.Timeout | undefined;

server.get("/applicationcommands", async (req, res) => {

  if (req.headers.authorization !== env.APPLICATION_COMMANDS_PASSWORD) {
    res.status(401).json({ message: "unauthorized" });
    return;
  }

  if (!commands.size) await loadApplicationCommands();

  const name = req.headers.command;
  if (name && typeof name === "string") {

    if (!commands.size) {
      loadApplicationCommands();
      res.json({});
      return;
    }

    const command = commands.get(name) || Array.from(commands.values()).find(cmd => cmd.id === name);
    res.json(command ? command : {});
    return;
  }

  res.json(Array.from(commands.values()));
  return;
})

export async function loadApplicationCommands() {

  if (timeout) return;

  await fetch(
    `https://discord.com/api/v10/applications/${env.SAPHIRE_ID}/commands`,
    {
      method: "GET",
      headers: { authorization: `Bot ${env.DISCORD_TOKEN}` }
    }
  )
    .then(res => res.json())
    .then(res => {

      if (Array.isArray(res))
        for (const command of (res as appCommand[]))
          commands.set(command.name, command);

      if (timeout) return;
      timeout = setTimeout(() => {
        timeout = undefined;
        loadApplicationCommands();
      }, 1000 * 30);

      return;
    })
    .catch(() => { });

}