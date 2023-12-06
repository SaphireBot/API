import { Schema, InferSchemaType, Types } from "mongoose";

export const UserSchema = new Schema({
    id: { type: String, unique: true },
    Likes: Number,
    locale: { type: String, default: "pt-BR" },
    Tokens: {
        access_token: String,
        refresh_token: Number,
        expires_at: Number
    },
    Xp: Number,
    Level: Number,
    Transactions: Array,
    Balance: Number,
    AfkSystem: String,
    DailyCount: Number,
    MixCount: Number,
    QuizCount: Number,
    CompetitiveMemoryCount: Number,
    ForcaCount: Number,
    GamingCount: {
        FlagCount: Number,
        AnimeThemeCount: Number,
        QuizAnime: Number,
        Logomarca: Number,
        QuizQuestions: Number
    },
    Timeouts: {
        Bug: Number,
        Daily: Number,
        ImagesCooldown: Number,
        Loteria: Number,
        Cantada: Number,
        Bitcoin: Number,
        Porquinho: Number,
        TopGGVote: Number,
        Rep: Number,
        Reputation: Number
    },
    Cache: { ComprovanteOpen: Boolean },
    Color: {
        Perm: Boolean,
        Set: String
    },
    Perfil: {
        Reputation: Array,
        Avatar: String,
        Titulo: String,
        Status: String,
        Sexo: String,
        Signo: String,
        Aniversario: String,
        Trabalho: String,
        BalanceOcult: Boolean,
        Marry: {
            Conjugate: String,
            StartAt: Number
        },
        Bits: Number,
        Bitcoins: Number,
        Estrela: {
            Um: Boolean,
            Dois: Boolean,
            Tres: Boolean,
            Quatro: Boolean,
            Cinco: Boolean,
            Seis: Boolean,
        }
    },
    Vip: {
        DateNow: Number,
        TimeRemaing: Number,
        Permanent: Boolean
    },
    Walls: {
        Bg: Array,
        Set: String
    },
    Jokempo: {
        Wins: Number,
        Loses: Number
    }
});

export type UserSchemaType = InferSchemaType<typeof UserSchema> & { _id: Types.ObjectId };