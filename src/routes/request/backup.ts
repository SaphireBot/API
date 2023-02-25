import { readFileSync } from "fs";
import { env } from "process";
import { server } from "../../server";

server.get("/backup", async (req, res) => {

    if (req.headers.authorization !== env.GET_BACKUP_ZIP)
        return res
            .status(401)
            .send("Authorization is not defined correctly.");

    const file = readFileSync("./src/services/backup/temp/backup.zip")

    return res.type("application/zip").send(file)
})