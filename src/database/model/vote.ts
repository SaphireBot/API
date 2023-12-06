import { Schema, InferSchemaType, Types } from "mongoose";

export const VoteSchema = new Schema({
    userId: String,
    messageId: String,
    channelId: String,
    guildId: String,
    messageUrl: String,
    deleteAt: Number,
    voted: Boolean,
    enableReminder: Boolean
});

export type VoteSchemaType = InferSchemaType<typeof VoteSchema> & { _id: Types.ObjectId };