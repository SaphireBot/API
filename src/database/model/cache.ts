import { QuickDB } from "quick.db"

export default new class Cache extends QuickDB {

    constructor() {
        super({ filePath: "cache.sqlite" })
    }
}