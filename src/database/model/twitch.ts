import { Schema, InferSchemaType, Types } from "mongoose";

export const TwitchSchema = new Schema({
    streamer: String,
    /**
     *  channelId: String,
     *  guildId: String,
     *  message: String || undefined,
     *  roleId: String || undefined
     */
    notifiers: Object
});

export type TwitchSchemaType = InferSchemaType<typeof TwitchSchema> & { _id: Types.ObjectId };