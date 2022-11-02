import { model, Schema } from "mongoose";
import { env } from "process";

export default model(<string>env.DB_CREDENTIALS,
    new Schema({
        ip: String,
        id: String,
        username: String,
        avatar: String,
        discriminator: String,
        email: String,
        guilds: [Object],
        loginDate: { type: Number, default: Date.now() }
    })
);