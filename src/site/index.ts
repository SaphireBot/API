import { Collection } from "discord.js";
import { staffData } from "../@types";
import { server } from "../server";
import bugs from "./bugs";
import userGet from "./user.get";
import giveawayGet from "./giveaway.get";
import topggPost from "./topgg.post";
import tokensSet from "./tokens.set";
import clientGet from "./client.get";
import statusGet from "./status.get";
import usersGet from "./users.get";
import reputationPost from "./perfil/reputation/reputation.post";
import reputationDelete from "./perfil/reputation/reputation.delete";
import getUsers from "./getUsers";
import staffGet from "./staff.get";
import { allGuilds, apiCommandsData, interactions } from "../websocket/connection";
import commandsdata from "./commandsdata";
import partners from "./partners";
import daily from "../websocket/functions/daily";
import save_login from "./save_login";
import database from "../database";
import commandBlocker from "./commands.block";

export const staffs = new Collection<string, staffData>();
const admins = new Set<string>();

setInterval(() => refreshAdmins(), 1000 * 60);
refreshAdmins()

server.get("/staffs", staffGet);
server.get("/getusers", getUsers);
server.get("/getusers/:id", getUsers);
server.get("/users/:CreatedBy/:Sponsor", usersGet);
server.get("/user/:userId", userGet);
server.get("/giveaway/:giveawayId", giveawayGet);
server.get("/clientdata", clientGet);
server.get("/status", statusGet);
server.get("/partners", partners);
server.get("/commandsdata", commandsdata);
server.get("/home", (_, res) => res.send({ guilds: allGuilds.size, commands: apiCommandsData.size, interactions: interactions.count }));
server.get("/servers", (_, res) => res.send(Array.from(new Set(allGuilds.keys()))));

server.post("/daily", (req, res) => daily(req.body as any, res));
server.post("/topgg", topggPost);
server.post("/discordtokens", tokensSet);
server.post("/bugs", bugs);
server.post("/reputation", reputationPost);
server.post("/save_login", save_login)
server.post("/commands", commandBlocker)

server.get("/admins", async (_, res) => res.send(Array.from(admins)));
server.get("/mods", async (_, res) => res.send(await database.Client.findOne({ id: process.env.SAPHIRE_BOT_ID })?.then(res => res?.Moderadores || [])));

server.delete("/reputation", reputationDelete);

async function refreshAdmins() {
    admins.clear();
    const adminsAtDatabase = await database.Client.findOne({ id: process.env.SAPHIRE_BOT_ID })?.then(res => res?.Administradores || []).catch(() => []);
    for (const adminId of adminsAtDatabase)
        admins.add(adminId);
    return;
}