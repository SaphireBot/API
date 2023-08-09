import cache from "./model/cache";
import client from "./model/client";
import guilds from "./model/guilds";

export default new class Database {
    Client: typeof client
    Cache: typeof cache
    Guilds: typeof guilds

    constructor() {
        this.Client = client
        this.Cache = cache
        this.Guilds = guilds
    }
}