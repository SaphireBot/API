import server from "../../server";
import login from "../../database/model/model.js";
import qs from "qs";
import os from "os"
import axios from "axios"
import { UserData } from "../../@types"
import { APIGuild } from "discord.js"
import { env } from "node:process"
// TODO: [object Promise] dropping at console.log
function getMachineIp(): string | void {
    const networkInfo = os.networkInterfaces();
    if (!networkInfo?.Ethernet?.[0]?.address) return
    return networkInfo?.Ethernet?.[0]?.address
}

server.get("/auth", async (_, res) => {

    const hasData: object | null = await login.exists({ ip: getMachineIp() }).catch(() => null)

    if (hasData)
        return res.redirect("/login");

    return res.redirect(env.AUTH_LOGIN_LINK);
});

server.get("/auth/redirect", async (req, res) => {
    try {
        const response = await axios({
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            data: qs.stringify({
                client_id: env.CLIENT_ID,
                client_secret: env.CLIENT_SECRET,
                grant_type: "authorization_code",
                code: (<Record<string, string>>req?.query)?.code,
                redirect_uri: "http://localhost:8080/auth/redirect"
            }),
            url: "https://discord.com/api/oauth2/token"
        })
            .then((resp) => resp.data);

        const info = await axios({
            method: "GET",
            headers: {
                authorization: `Bearer ${response.access_token}`
            },
            url: "https://discord.com/api/users/@me"
        })
            .then((resp): Promise<UserData> => resp.data);

        const saphireGuilds = await axios({
            method: "GET",
            headers: {
                authorization: env.GUILDS_ACCESS
            },
            url: env.ROUTE_SAPHIRE_GUILDS
        })
            .then((resp) => resp.data);

        const guilds: APIGuild[] = await axios({
            method: "GET",
            headers: {
                authorization: `Bearer ${response.access_token}`
            },
            url: "https://discord.com/api/users/@me/guilds"
        })
            .then((resp) => resp.data
                .map((guild: APIGuild) =>
                    saphireGuilds.includes(guild.id)
                        ? {
                            id: guild.id,
                            name: guild.name,
                            icon: guild.icon,
                            owner: guild.owner,
                            permissions: guild.permissions,
                            inServerBot: true
                        }
                        : {
                            id: guild.id,
                            name: guild.name,
                            icon: guild.icon,
                            owner: guild.owner,
                            permissions: guild.permissions,
                            inServerBot: false
                        }
                ));

        await login.create({
            ip: getMachineIp(),
            id: info.id,
            username: info.username,
            avatar: info.avatar,
            discriminator: info.discriminator,
            email: info.email,
            guilds: guilds,
            loginDate: Date.now()
        });

        return res.redirect("/login")

    } catch (error) {
        return res
            .status(500)
            .send({
                status: "500 - Internal Server Error",
                message: "An error ocurred",
                error
            });
    }

});

server.get("/login", async (_, res): Promise<void | object> => {

    const userData = await login.findOne({ ip: getMachineIp() })?.catch(() => null);
    if (!userData) return res.redirect("/auth");

    return res
        .status(200)
        .send({
            status: "200 - OK",
            ip: userData.ip,
            id: userData.id,
            username: userData.username,
            avatar: `https://cdn.discordserver.com/avatars/${userData.id}/${userData.avatar}`,
            discriminator: userData.discriminator,
            email: userData.email,
            guilds: userData.guilds,
            loginDate: userData.loginDate,
            loggedTime: getTime((Date.now() - userData.loginDate) - 86400000),
            timeToExpireConnection: getTime((Date.now() - userData.loginDate) - 86400000)
        });

});

server.get("/logout", async (_, res) => {
    const isLogged = await login.deleteOne({ ip: getMachineIp() });

    if (isLogged.deletedCount < 1)
        return res
            .send({
                status: 404,
                message: "Você não está logado."
            })

    return res
        .status(200)
        .send({
            status: "200 - OK",
            message: "Desconectado com sucesso."
        })
});

setInterval(async (): Promise<void> => {

    const verifyDate = await login.find({}) || [];
    if (!verifyDate || !verifyDate.length) return;

    const toDelete = verifyDate.filter(data => (Date.now() - data.loginDate) >= (1000 * 60) * 60) || []
    if (!toDelete || !toDelete.length) return;

    const query = toDelete.map(data => data.ip)
    await login.deleteMany({ ip: query })

    return;
}, 300000);

function getTime(time: number): string { //TODO: Retorno errado
    const hours: number = Math.floor(time / 3600);
    const minutes: number = Math.floor((time % 3600) / 60);
    const seconds: number = time % 60;
    return hours + "h " + minutes + "m " + seconds + "s";
}