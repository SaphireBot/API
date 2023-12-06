import { Schema, InferSchemaType, Types } from "mongoose";

export const AfkSchema = new Schema({
    guildId: { type: String, default: "" },
    userId: String,
    message: { type: String, default: "" },
    type: String,
    deleteAt: Date
});

export type AfkSchemaType = InferSchemaType<typeof AfkSchema> & { _id: Types.ObjectId };