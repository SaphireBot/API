import cache from "./model/cache";
import { ClientSchema } from "./model/client";
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

    constructor() { }

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