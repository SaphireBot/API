import { QuickDB } from "quick.db"

export default new class Cache extends QuickDB {
    Twitch: QuickDB

    constructor() {
        super({ filePath: "cache.sqlite" })
        this.Twitch = this.table("Twitch")
    }
}