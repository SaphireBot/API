import { Schema, InferSchemaType, Types } from "mongoose";

export const CommandSchema = new Schema({
    id: String,
    count: Number,
    usage: Object
});

export type CommandSchemaType = InferSchemaType<typeof CommandSchema> & { _id: Types.ObjectId };