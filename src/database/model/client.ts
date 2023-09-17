import { Schema, model, InferSchemaType, Types } from "mongoose";

const ClientSchema = new Schema({
    id: { type: String, unique: true },
    TwitchAccessToken: { type: String, unique: true },
    uptime: {
        primary: Date,
        accumulate: Number
    },
    Timeouts: { RestoreDividas: Number },
    ComandosUsados: Number,
    SpotifyAccessToken: String,
    TwitchNotifications: Number,
    CommandsCount: Object,
    Moderadores: [String],
    Administradores: [String],
    TopGlobal: Object,
    ComandosBloqueados: Array,
    ComandosBloqueadosSlash: Array,
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

export default model("Client", ClientSchema);
export type ClientSchema = InferSchemaType<typeof ClientSchema> & { _id: Types.ObjectId };