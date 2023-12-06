import { Schema, InferSchemaType, Types } from "mongoose";

export const ClientSchema = new Schema({
    id: { type: String, unique: true },
    TwitchAccessToken: { type: String, unique: true },
    TotalBalanceSended: { type: Number, default: 0 },
    uptime: {
        primary: Date,
        accumulate: Number
    },
    Timeouts: { RestoreDividas: Number },
    ComandosUsados: Number,
    SpotifyAccessToken: String,
    TwitchNotifications: Number,
    Moderadores: [String],
    Administradores: [String],
    TopGlobal: Object,
    BlockedCommands: [{ cmd: String, error: String }],
    VipCodes: Array,
    BackgroundAcess: [String],
    BlockedUsers: Array,
    PremiumServers: Array,
    FlagGame: {
        TopOne: String
    },
    Raspadinhas: {
        Bought: Number,
        totalPrize: Number
    },
    Zeppelin: {
        winTotalMoney: Number,
        loseTotalMoney: Number,
        Explode: Number,
        distanceData: {
            value: Number,
            winner: String
        }
    },
    Titles: {
        BugHunter: [String],
        OfficialDesigner: [String],
        Halloween: [String],
        Developer: [String]
    },
    Blacklist: {
        Users: Array,
        Guilds: Array,
        Economy: Array
    },
    Porquinho: {
        LastPrize: Number,
        LastWinner: String,
        Money: Number
    },
    CantadasIndicadas: [{
        userId: String,
        cantada: String,
        cantadaId: String
    }],
    AnimeQuizIndication: Array,
    QuizCategoryIndications: Array,
    QuizQuestionsIndications: Array,
    QuizQuestionsReports: Array
});

export type ClientSchemaType = InferSchemaType<typeof ClientSchema> & { _id: Types.ObjectId };