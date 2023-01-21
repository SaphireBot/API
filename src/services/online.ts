import { env } from "process";
import server from "../server";
import sender from "../webhooks/sender";
import json from "../json/data.json"

server.post("/online", async (req, res) => {

    if (req.headers.authorization !== env.LOGIN_ACCESS)
        return res
            .status(401)
            .send("Authorization is not defined correctly.");

    res.status(200).send()

    return await sender({
        url: process.env.WEBHOOK_STATUS,
        content: `${json.emojis.check} | A aplicação conectou com a API com sucesso pela máquina \`${req.headers.hostname || "No Machine Defined"}\`.`
    })
})