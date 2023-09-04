import Mongoose from "mongoose"
const { Schema, model } = Mongoose

export default model("Blacklist", new Schema({
    id: { type: String, unique: true },
    type: { type: String }, // user | guild | economy
    removeIn: { type: Date, default: undefined },
    addedAt: { type: Date },
    staff: { type: String }
}))