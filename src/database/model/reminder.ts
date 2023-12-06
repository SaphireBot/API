import { Schema, InferSchemaType, Types } from "mongoose";

export const ReminderSchema = new Schema({
    id: { type: String, unique: true },
    userId: String,
    guildId: String,
    message: String,
    lauchAt: Date,
    isAutomatic: { type: Boolean, default: false },
    createdAt: Date,
    channelId: String,
    alerted: { type: Boolean, default: false },
    sendToDM: { type: Boolean, default: false },
    interval: Number,
    messageId: String,
    disableComponents: Date,
    deleteAt: Date,
    reminderIdToRemove: String
});

export type ReminderSchemaType = InferSchemaType<typeof ReminderSchema> & { _id: Types.ObjectId };