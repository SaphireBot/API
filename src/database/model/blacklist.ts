import { Schema, InferSchemaType, Types } from "mongoose";

export const BlacklistSchema = new Schema({
    id: { type: String, unique: true },
    type: { type: String }, // user | guild | economy
    removeIn: { type: Date, default: null },
    addedAt: { type: Date },
    staff: { type: String },
    reason: { type: String }
});

export type BlacklistSchemaType = InferSchemaType<typeof BlacklistSchema> & { _id: Types.ObjectId };