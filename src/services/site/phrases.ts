import { SiteHomePhrases } from "../../json/data.json"
import { env } from "node:process"
import server from "../../server"

server.get("/phrases", async (req, res) => {

    if (req.headers?.authorization !== env.PHRASES_ACCESS)
        return res
            .status(401)
            .send("Authorization is not defined correctly.");

    return res
        .status(200)
        .send(SiteHomePhrases[Math.floor(Math.random() * SiteHomePhrases.length)]);

})