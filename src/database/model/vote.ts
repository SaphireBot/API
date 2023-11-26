import { Schema, model, InferSchemaType, Types } from "mongoose";

const Vote = new Schema({
    userId: String,
    messageId: String,
    channelId: String,
    guildId: String,
    messageUrl: String,
    deleteAt: Number,
    voted: Boolean,
    enableReminder: Boolean
});

export default model("Vote", Vote);
export type VoteSchema = InferSchemaType<typeof Vote> & { _id: Types.ObjectId };