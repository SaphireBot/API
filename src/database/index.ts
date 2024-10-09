import cache from "./model/cache";
import { ClientSchema, ClientSchemaType } from "./model/client";
import { GuildSchema } from "./model/guilds";
import { UserSchema } from "./model/user";
import { RecordMongooseCluster, SaphireMongooseCluster } from "../load";
import { BlacklistSchema } from "./model/blacklist";
import { TwitchSchema } from "./model/twitch";
import { ReminderSchema } from "./model/reminder";
import { CommandSchema } from "./model/commands";
import { AfkSchema } from "./model/afk";
import { VoteSchema } from "./model/vote";
import { MercadoPagoPaymentSchema } from "./model/mercadoPagoSchema";
import { RedisRanking } from "./redis";
import { env } from "node:process";
import { mods, admins } from "../site";
import { interactions } from "../websocket/connection";

export default new class Database {
    Cache = typeof cache
    Client = SaphireMongooseCluster.model("Client", ClientSchema);
    Guild = SaphireMongooseCluster.model("Guilds", GuildSchema);
    User = SaphireMongooseCluster.model("Users", UserSchema);
    Blacklist = SaphireMongooseCluster.model("Blacklist", BlacklistSchema);
    Twitch = SaphireMongooseCluster.model("Twitch", TwitchSchema);
    Reminders = SaphireMongooseCluster.model("Reminders", ReminderSchema);
    Commands = SaphireMongooseCluster.model("Commands", CommandSchema);
    Afk = SaphireMongooseCluster.model("Afk", AfkSchema);
    Vote = SaphireMongooseCluster.model("Vote", VoteSchema);
    Payments = RecordMongooseCluster.model("MercadoPago", MercadoPagoPaymentSchema);

    declare clientData: ClientSchemaType | undefined;

    constructor() { }

    async getClientData() {

        if (this.clientData)
            return this.clientData;

        try {

            const data = await this.Client.findOne({ id: env.SAPHIRE_ID });

            if (data) {
                this.clientData = data.toObject();

                if (this.clientData.Moderadores?.length) {
                    mods.clear();
                    for (const modId of this.clientData.Moderadores) mods.add(modId);
                }
                if (this.clientData.Administradores?.length) {
                    admins.clear();
                    for (const adminId of this.clientData.Moderadores) admins.add(adminId);
                }

                if ((this.clientData.ComandosUsados || 0) > 0)
                    interactions.count = this.clientData.ComandosUsados || 0;

                return this.clientData;
            }

        } catch (err) { }
        return;
    }

    watch() {

        // const guildIds: Types.ObjectId[] = []
        // const userIds: Types.ObjectId[] = []

        // this.Guild.watch()
        //     .on("change", async change => {

        //         if (["update", "insert"].includes(change.operationType)) {

        //             if (guildIds.length)
        //                 return guildIds.push(change.documentKey._id)

        //             guildIds.push(change.documentKey._id)
        //             setTimeout(async () => {
        //                 if (!guildIds.length) return
        //                 const ids = Array.from(new Set(guildIds.splice(0)))
        //                 const documents = await this.Guild.find({ _id: { $in: ids } });

        //                 for (const doc of documents)
        //                     if (doc?.id) set(doc.id, doc.toObject())
        //             }, 1000)
        //             return
        //         }

        //     });

        this.Client.watch()
            .on("change", async change => {

                try {
                    const data = await this.Client.findOne({ id: env.SAPHIRE_ID });
                    this.clientData = data?.toObject() || undefined;

                    if (data?.Moderadores?.length) {
                        mods.clear();
                        for (const modId of data.Moderadores) mods.add(modId);
                    }
                    if (data?.Administradores?.length) {
                        admins.clear();
                        for (const adminId of data.Moderadores) admins.add(adminId);
                    }

                    if ((data?.ComandosUsados || 0) > 0)
                        interactions.count = data?.ComandosUsados || 0;
                } catch (err) { }

                return;
            })

        this.User.watch()
            .on("change", async change => {

                if (["update", "insert"].includes(change.operationType)) {
                    const document = await this.User.findById(change.documentKey._id);

                    if (
                        typeof document?.id === "string"
                        && typeof document?.Balance === "number"
                    )
                        await RedisRanking.zAdd("balance", [{ score: document.Balance || 0, value: document.id }]);

                    return;
                }

            });

        return;
    }
}