import { Schema, InferSchemaType, Types } from "mongoose";

export const GuildSchema = new Schema({
    id: { type: String, unique: true },
    Giveaways: [{
        MessageID: { type: String, unique: true },
        GuildId: String,
        Prize: String,
        Winners: Number,
        LauchDate: Number,
        WinnersGiveaway: [String],
        Participants: [String],
        Emoji: String,
        TimeMs: Number,
        DateNow: Number,
        ChannelId: String,
        Actived: Boolean,
        MessageLink: String,
        CreatedBy: String,
        Sponsor: String,
        AllowedRoles: [String],
        LockedRoles: [String],
        AllowedMembers: [String],
        LockedMembers: [String],
        RequiredAllRoles: Boolean,
        AddRoles: [String],
        MultipleJoinsRoles: [{ id: String, joins: Number }],
        MinAccountDays: Number,
        MinInServerDays: Number
    }],
    Prefixes: [String],
    Bans: [{ userId: String, unbanAt: Date }],
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
            active: Boolean
        },
        unban: {
            active: Boolean
        },
        kick: {
            active: Boolean
        },
        mute: {
            active: Boolean
        },
        channels: {
            active: Boolean
        },
        messages: {
            active: Boolean
        },
        botAdd: {
            active: Boolean
        },
        roles: {
            active: Boolean
        }
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

export type GuildSchemaType = InferSchemaType<typeof GuildSchema> & { _id: Types.ObjectId };