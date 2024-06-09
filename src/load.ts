import { Mongoose } from "mongoose";
import database from "./database";
import { refreshPartnersStatus, shardsAndSockets } from "./websocket/connection";
import applicationCommands from "./websocket/functions/application.commands";
import Blacklist from "./blacklist/manager"
import { discloud } from "discloud.app";
import { env } from "process";
const linkConnection = env.MACHINE === "localhost" ? env.CANARY_DATABASE_LINK_CONNECTION : env.SAPHIRE_DATABASE_LINK_CONNECTION;

// Users, Guilds, ..., Database
const SaphireMongoose = new Mongoose();
export const SaphireMongooseCluster = SaphireMongoose.set("strictQuery", true).createConnection(linkConnection);
SaphireMongooseCluster.on("connected", () => {
    console.log("[Mongoose] Cluster Saphire Connected");
    database.watch();
    shardsAndSockets.random()?.send({ type: "sendStaffData" });
    applicationCommands();
    Blacklist.load();
    refreshPartnersStatus();
});
SaphireMongooseCluster.on("disconnected", () => {
    discloud.apps.restart("ways");
    console.log("[Mongoose] Cluster Saphire Disconnected");
});
SaphireMongooseCluster.on("error", error => {
    discloud.apps.restart("ways");
    console.log("[Mongoose] Cluster Saphire | FAIL\n--> " + error);
});

// Bets, Games, Safiras, ..., Database
const BetMongoose = new Mongoose();
export const BetMongooseCluster = BetMongoose.set("strictQuery", true).createConnection(process.env.DATABASE_BET_LINK_CONNECTION);
BetMongooseCluster.on("connected", () => console.log("[Mongoose] Cluster Bet Connected"));
BetMongooseCluster.on("disconnected", () => {
    discloud.apps.restart("ways");
    console.log("[Mongoose] Cluster Bet Disconnected");
});
BetMongooseCluster.on("error", error => {
    discloud.apps.restart("ways");
    console.log("[Mongoose] Bet Database | FAIL\n--> " + error);
});

// Change Logs Database
const RecordMongoose = new Mongoose();
export const RecordMongooseCluster = RecordMongoose.set("strictQuery", true).createConnection(process.env.DATABASE_RECORD_LINK_CONNECTION);
RecordMongooseCluster.on("connected", () => console.log("[Mongoose] Cluster Record Connected"));
RecordMongooseCluster.on("disconnected", () => {
    discloud.apps.restart("ways");
    console.log("[Mongoose] Cluster Record Disconnected");
});
RecordMongooseCluster.on("error", error => {
    discloud.apps.restart("ways");
    console.log("[Mongoose] Bet Database | FAIL\n--> " + error);
});