import { Schema, model, InferSchemaType, Types } from "mongoose";

const GuildSchema = new Schema({
    id: { type: String, unique: true },
    Giveaways: [{
        MessageID: { type: String, unique: true },
        GuildId: String,
        Prize: String,
        Winners: { type: Number },
        WinnersGiveaway: [String],
        Participants: [String],
        Emoji: String,
        TimeMs: { type: Number },
        DateNow: { type: Number },
        ChannelId: String,
        Actived: Boolean,
        MessageLink: String,
        CreatedBy: String,
        Sponsor: String,
        AllowedRoles: [String],
        LockedRoles: [String],
        AllowedMembers: [String],
        LockedMembers: [String],
        RequiredAllRoles: [String],
        AddRoles: [String],
        MultipleJoinsRoles: [String],
        MinAccountDays: { type: Number },
        MinInServerDays: { type: Number },
    }],
    Prefixes: [String],
    TempCall: {
        enable: Boolean,
        muteTime: Boolean,
        members: Object,
        membersMuted: Object,
    },
    Spam: {
        enabled: { type: Boolean, default: false },
        ignoreChannels: { type: Array, default: [] },
        ignoreRoles: { type: Array, default: [] },
        filters: {
            capsLock: {
                enabled: { type: Boolean, default: false },
                percent: { type: Number, default: 0, max: 100, min: 0 },
            },
            messagesTimer: {
                enabled: { type: Boolean, default: false },
                amount: { type: Number, default: 3 },
                seconds: { type: Number, default: 2 },
            },
            repeat: {
                enabled: { type: Boolean, default: false },
            },
        },
    },
    Chest: { type: Boolean, default: true },
    // Polls: Array,
    Moeda: String,
    FirstSystem: Boolean,
    Autorole: [String],
    // CommandBlocks: Array,
    TwitchNotifications: [{
        streamer: String,
        channelId: String,
        guildId: String,
        message: String || undefined,
        roleId: String || undefined,
    }],
    MinDay: {
        days: Number,
        punishment: String, // Kick | Ban | Warn
    },
    announce: {
        channel: String,
        allowedRole: String,
        notificationRole: String,
        crosspost: Boolean,
    },
    LogSystem: {
        channel: String,
        webhookUrl: String,
        ban: {
            active: Boolean,
        },
        unban: {
            active: Boolean,
        },
        kick: {
            active: Boolean,
        },
        mute: {
            active: Boolean,
        },
        channels: {
            active: Boolean,
        },
        messages: {
            active: Boolean,
        },
        botAdd: {
            active: Boolean,
        },
        roles: {
            active: Boolean,
        },
    },
    XpSystem: {
        Canal: String,
        Mensagem: String,
    },
    LeaveChannel: {
        channelId: String,
        body: Object,
    },
    WelcomeChannel: {
        channelId: String,
        body: Object,
    },
    Stars: {
        limit: Number,
        channel: String,
        sended: Array,
    },
});

export default model("Guild", GuildSchema);
export type GuildSchema = InferSchemaType<typeof GuildSchema> & { _id: Types.ObjectId };