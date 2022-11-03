import { fetch } from "undici"
import { env } from "node:process"
import { CommandsSaphire } from "../../@types/index"
import server from "../../server"

server.get("/commands", async (req, res) => {

    if (req.headers?.authorization !== env.COMMAND_ACCESS)
        return res
            .status(401)
            .send("Authorization is not defined correctly.");

    const commands = <CommandsSaphire[] | object>await fetch(
        env.ROUTE_SAPHIRE_COMMANDS,
        {
            method: "GET",
            headers: {
                authorization: env.COMMAND_ACCESS,
            }
        }
    )
        .then(
            async data => await data.json(),
            async rejected => await rejected
        )
        .catch(error => <object>({ error: <Error>error, message: "Não foi possível obter os comandos." }));

    if (!Array.isArray(commands))
        return res
            .status(500)
            .send({
                status: "Não foi possível obter os comandos",
                error: commands
            })

    return res
        .status(200)
        .send(commands)

})