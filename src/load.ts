import { Mongoose } from "mongoose";

// Users, Guilds, ..., Database
const SaphireMongoose = new Mongoose();
export const SaphireMongooseCluster = SaphireMongoose.set("strictQuery", true).createConnection(process.env.DATABASE_LINK_CONNECTION);
SaphireMongooseCluster.on("connected", () => console.log("[Mongoose] Cluster Saphire Connected"));
SaphireMongooseCluster.on("disconnected", () => console.log("[Mongoose] Cluster Saphire Disconnected"));
SaphireMongooseCluster.on("error", error => console.log("[Mongoose] Cluster Saphire | FAIL\n--> " + error));

// Bets, Games, Safiras, ..., Database
const BetMongoose = new Mongoose();
export const BetMongooseCluster = BetMongoose.set("strictQuery", true).createConnection(process.env.DATABASE_BET_LINK_CONNECTION);
BetMongooseCluster.on("connected", () => console.log("[Mongoose] Cluster Bet Connected"));
BetMongooseCluster.on("disconnected", () => console.log("[Mongoose] Cluster Bet Disconnected"));
BetMongooseCluster.on("error", error => console.log("[Mongoose] Bet Database | FAIL\n--> " + error));

// Change Logs Database
const RecordMongoose = new Mongoose();
export const RecordMongooseCluster = RecordMongoose.set("strictQuery", true).createConnection(process.env.DATABASE_RECORD_LINK_CONNECTION);
RecordMongooseCluster.on("connected", () => console.log("[Mongoose] Cluster Record Connected"));
RecordMongooseCluster.on("disconnected", () => console.log("[Mongoose] Cluster Record Disconnected"));
RecordMongooseCluster.on("error", error => console.log("[Mongoose] Bet Database | FAIL\n--> " + error));