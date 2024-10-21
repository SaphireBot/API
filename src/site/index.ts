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
export const admins = new Set<string>();
export const mods = new Set<string>();

setInterval(() => refreshStaff(), 1000 * 60);
refreshStaff()

server.get("/staffs", (req, res) => {
    staffGet(req, res);
});
server.get("/getusers", async (req, res) => {
    await getUsers(req, res);
});
server.get("/getusers/:id", async (req, res) => {
    await getUsers(req, res);
});
server.get("/users/:CreatedBy/:Sponsor", async (req, res) => {
    await usersGet(req, res);
});
server.get("/user/:userId", async (req, res) => {
    await userGet(req, res);
});
server.get("/giveaway/:giveawayId", (req, res) => {
    giveawayGet(req, res);
});
server.get("/clientdata", async (req, res) => {
    await clientGet(req, res);
});
server.get("/status", async (req, res) => {
    await statusGet(req, res);
});
server.get("/partners", (req, res) => {
    partners(req, res);
});
server.get("/commandsdata", (req, res) => {
    commandsdata(req, res);
});
server.get("/home", async (_, res) => {
    res.send({
        guilds: allGuilds.size,
        commands: apiCommandsData.size,
        interactions: (await database.getClientData())?.ComandosUsados || interactions.count || 0
    })
});
server.get("/servers", (_, res) => {
    res.send(Array.from(new Set(allGuilds.keys())));
});

server.post("/daily", (req, res) => {
    daily(req.body as any, res);
});
server.post("/topgg", async (req, res) => {
    await topggPost(req, res);
});
server.post("/discordtokens", async (req, res) => {
    await tokensSet(req, res);
});
server.post("/bugs", async (req, res) => {
    await bugs(req, res);
});
server.post("/reputation", async (req, res) => {
    await reputationPost(req as any, res);
});
server.post("/save_login", async (req, res) => {
    await save_login(req, res);
})
server.post("/commands", async (req, res) => {
    await commandBlocker(req, res);
})

server.get("/admins", (_, res) => {
    res.send(Array.from(admins))
});
server.get("/mods", (_, res) => {
    res.send(Array.from(mods))
});

server.delete("/reputation", async (req, res) => {
    await reputationDelete(req, res);
});

async function refreshStaff() {
    admins.clear();

    const data = await database.getClientData()
        ?.then(res => ({
            admins: res?.Administradores || [],
            mods: res?.Moderadores || []
        }))
        .catch(() => ({
            admins: [],
            mods: []
        }));

    for (const adminId of data.admins) admins.add(adminId);
    for (const modId of data.mods) mods.add(modId);
    return;
}