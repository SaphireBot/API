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
export const staffs = new Collection<string, staffData>();

server.get("/staffs", staffGet);
server.get("/getusers", getUsers);
server.get("/getusers/:id", getUsers);
server.get("/users/:CreatedBy/:Sponsor", usersGet);
server.get("/user/:userId", userGet);
server.get("/giveaway/:giveawayId", giveawayGet);
server.get("/clientdata", clientGet);
server.get("/status", statusGet);
server.get("/home", (_, res) => res.send({ guilds: allGuilds.size, commands: apiCommandsData.size, interactions: interactions.count }));
server.get("/commandsdata", commandsdata);
server.get("/servers", (_, res) => res.send(Array.from(new Set(allGuilds.keys()))));

server.post("/topgg", topggPost);
server.post("/discordtokens", tokensSet);
server.post("/bugs", bugs);
server.post("/reputation", reputationPost);

server.delete("/reputation", reputationDelete);