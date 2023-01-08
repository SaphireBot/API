import axios from "axios";
import { env } from "process";
import { OnlineAlert } from "../@types";
import logout from "../checker/logout";
import server from "../server";
let discloud = false
let squarecloud = false

server.post("/online", async (req, res) => {

    const { authorization, host } = req.body as OnlineAlert

    if (authorization !== env.LOGIN_ACCESS)
        return res
            .status(401)
            .send("Authorization is not defined correctly.");

    if (host === "Discloud") {
        squarecloud = await axios.get("https://bot.squareweb.app/", { timeout: 5000 })
            .then(() => true)
            .catch(() => false)
        discloud = true
    }

    if (host === "Squarecloud") {
        discloud = await axios.get("https://saphire.discloud.app/", { timeout: 5000 })
            .then(() => true)
            .catch(() => false)
        squarecloud = true
    }

    if (discloud && squarecloud) {
        squarecloud = false
        res.status(200).send({ continue: "Logout" })
        return logout()
    }

    return res.status(200).send({ continue: "Online" })
})