import { env } from "process"
import Database, { redis } from "../database"
import { messagesToSend } from "../services/message/message.post"
import { ButtonStyle, parseEmoji, time } from "discord.js"
import { TwitchLanguages } from "../json/data.json"
import { FetchError, OauthToken, OauthValidade, OfflineStreamersToNotifier, RemoveChannelParams, StreamData, UpdateManyStreamerParams, UpdateStreamerParams, UserData } from "../@types/twitch"
import { CallbackType } from "../@types"
import { set } from "../websocket/cache/get.cache"
import { GuildSchema } from "../database/model/guilds"

export default new class Twitch {
    streamers: string[] // ['alanzoka', 'cellbit', ...]
    toCheckStreamers: string[] // ['alanzoka', 'cellbit', ...]
    data: Record<string, string[]> // { 'alanzoka': [...channelsId], 'cellbit': [...channelsId], ... }
    tempCache: Record<string, string[]> // { 'alanzoka': [...channelsId], 'cellbit': [...channelsId], ... }
    channelsNotified: Record<string, string[]> // { 'alanzoka': [...channelsId], 'cellbit': [...channelsId], ... }
    rolesIdMentions: Record<string, string | undefined> // { 'alanzoka_channelId': roleId, 'cellbit_channelId': roleId, ... }
    customMessage: Record<string, string | undefined> // { 'alanzoka_channelId': 'text...', 'cellbit_channelId': 'text...', ... }
    streamersOffline: string[] // ['cellbit']
    streamersOnline: string[] // ['alanzoka']
    onTimeout: boolean // If API Request is under 50 requests remaining
    notifications: number
    allGuildsID: number
    guildsId: string[]
    awaitingRequests: number
    notificationInThisSeason: number
    rateLimit: {
        MaxLimit: number
        remaining: number
        inCheck: boolean,
    }
    TwitchAccessToken: string | undefined

    constructor() {
        this.streamers = []
        this.toCheckStreamers = [] // ['alanzoka', 'cellbit', ...]
        this.data = {} // { 'alanzoka': [...channelsId], 'cellbit': [...channelsId], ... }
        this.tempCache = {} // { 'alanzoka': [...channelsId], 'cellbit': [...channelsId], ... }
        this.channelsNotified = {} // { 'alanzoka': [...channelsId], 'cellbit': [...channelsId], ... }
        this.rolesIdMentions = {} // { 'alanzoka_channelId': roleId, 'cellbit_channelId': roleId, ... }
        this.customMessage = {} // { 'alanzoka_channelId': 'text...', 'cellbit_channelId': 'text...', ... }
        this.streamersOffline = [] // ['cellbit']
        this.streamersOnline = [] // ['alanzoka']
        this.onTimeout = false // If API Request is under 50 requests remaining
        this.notifications = 0
        this.allGuildsID = 0
        this.awaitingRequests = 0
        this.notificationInThisSeason = 0
        this.guildsId = []
        this.rateLimit = {
            MaxLimit: 800,
            remaining: 800,
            inCheck: false,
        }
    }

    async checkAccessTokenAndStartLoading() {

        if (!this.TwitchAccessToken) return this.renewToken(true)

        // https://dev.twitch.tv/docs/authentication/validate-tokens/#how-to-validate-a-token
        return await fetch(
            "https://id.twitch.tv/oauth2/validate",
            {
                method: "GET",
                headers: { Authorization: `OAuth ${this.TwitchAccessToken}` }
            }
        )
            .then(res => res.json())
            .then((data: OauthValidade | FetchError) => {

                if ("status" in data)
                    return this.renewToken(true)

                // 24hrs in seconds
                if (data.expires_in < 86400)
                    return this.renewToken(true)

                return this.load()
            })
            .catch(err => console.log("Function checkAccessTokenAndStartLoading", err))

    }

    async getToken() {
        return await Database.Client.findOne({ id: env.SAPHIRE_BOT_ID })
            .then(doc => {
                this.TwitchAccessToken = doc?.TwitchAccessToken
                return this.checkAccessTokenAndStartLoading()
            })
            .catch(console.log)
    }

    async renewToken(isIniciating: boolean) {
        // https://dev.twitch.tv/docs/api/get-started/
        return await fetch(
            `https://id.twitch.tv/oauth2/token?client_id=${env.TWITCH_CLIENT_ID}&client_secret=${env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
            {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" }
            }
        )
            .then(res => res.json())
            .then(async (data: OauthToken | FetchError) => {

                if ("status" in data)
                    return console.log("Fail to validate the token")

                return await Database.Client.updateOne(
                    { id: env.SAPHIRE_BOT_ID },
                    { $set: { TwitchAccessToken: data.access_token } }
                )
                    .then(() => {
                        this.TwitchAccessToken = data.access_token
                        if (isIniciating) return this.load()
                        return
                    })
                    .catch(err => console.log("Function renewToken", err))
            })
            .catch(err => console.log("Function renewToken", err))
    }

    async load() {

        await this.refreshStreamersCache()
        this.notifications = Array.from(
            new Set(
                Object.values(this.channelsNotified).flat()
            )
        ).flat().length

        const guildsDocuments = await Database.Guild.find({ TwitchNotifications: { $exists: true } }, "id TwitchNotifications").then(doc => doc.filter(d => d.TwitchNotifications.length && d.id)) || []
        this.allGuildsID = guildsDocuments.length
        this.guildsId = guildsDocuments.map(d => d.id)

        for (const { TwitchNotifications } of guildsDocuments)
            for (const { streamer, channelId, roleId, message } of TwitchNotifications) { // [..., { channelId: '123', streamer: 'alanzoka', roleId: '123' }, ...]
                if (!streamer || !channelId) continue
                if (!this.data[streamer]) this.data[streamer] = []
                if (!this.channelsNotified[streamer]) this.channelsNotified[streamer] = []
                if (!this.streamers.includes(streamer) && !this.toCheckStreamers.includes(streamer)) {
                    this.streamers.push(streamer)
                    this.toCheckStreamers.push(streamer)
                }

                if (![this.data[streamer], this.channelsNotified[streamer]].flat().includes(channelId))
                    this.data[streamer].push(channelId)

                if (roleId) this.rolesIdMentions[`${streamer}_${channelId}`] = roleId
                if (message) this.customMessage[`${streamer}_${channelId}`] = message
                continue
            }

        this.streamers = Array.from(new Set(this.streamers)).flat().filter(i => i).map(streamer => streamer.toLowerCase())

        const offlinesCached = this.streamers.filter(streamer => !this.streamersOnline.includes(streamer))
        if (offlinesCached.length) this.streamersOffline.push(...offlinesCached)
        if (this.streamersOffline.length)
            await Database.Cache.Twitch.set("StreamersOffline", this.streamersOffline)
        this.checkStreamersStatus()
        this.saveChannelsNotified()
        this.setCounter()
        return
    }

    async checkStreamersStatus(): Promise<NodeJS.Timeout> {

        let streamers = this.toCheckStreamers.slice(0, 100)

        if (!streamers.length) {
            this.toCheckStreamers = this.streamers
            streamers = this.toCheckStreamers.slice(0, 100)
        }

        if (streamers?.length) {
            const streamersStatus = await this.fetcher<StreamData[]>(`https://api.twitch.tv/helix/streams?${streamers.map(str => `user_login=${str}`).join("&")}`)
            if (streamersStatus !== "TIMEOUT" && Array.isArray(streamersStatus)) {
                this.offlineStreamers(
                    this.streamers
                        .filter(streamer => !streamersStatus.some(data => data?.user_login == streamer))
                )

                this.onlineStreamers(streamersStatus.filter(data => this.data[data?.user_login]?.length))
            }

            streamers.splice(0, streamers.length)
        }

        return setTimeout(() => this.checkStreamersStatus(), 1000 * 5)
    }

    async refreshStreamersCache(inital = true): Promise<NodeJS.Timeout> {
        const StreamersOnline: string[] = this.streamersOnline.length
            ? await (async () => {
                const arr = await Database.Cache.Twitch.get("StreamersOnline") || []
                return await Database.Cache.Twitch.set("StreamersOnline", Array.from(new Set([...this.streamersOnline, ...arr]))) || []
            })()
            : await Database.Cache.Twitch.get("StreamersOnline") || []

        const StreamersOffline: string[] = this.streamersOffline.length
            ? await (async () => {
                const arr: string[] = await Database.Cache.Twitch.get("StreamersOffline") || []
                return await Database.Cache.Twitch.set("StreamersOffline", Array.from(new Set([...this.streamersOffline, ...arr]))) || []
            })()
            : await Database.Cache.Twitch.get("StreamersOffline") || []

        this.streamersOnline = Array.from(new Set(StreamersOnline)).filter(i => i).flat()
        this.streamersOffline = Array.from(new Set(StreamersOffline)).filter(i => i).flat()

        if (inital) {
            const channelsNotified = await Database.Cache.Twitch.get("channelsNotified") || {}
            for (const streamer of this.streamers) {
                if (!channelsNotified[streamer]) channelsNotified[streamer] = []
                if (channelsNotified[streamer].length)
                    channelsNotified[streamer] = Array.from(new Set(channelsNotified[streamer])).flat().filter(i => i)
            }
            this.channelsNotified = channelsNotified
            await Database.Cache.Twitch.set("channelsNotified", this.channelsNotified)
        }

        await Database.Cache.Twitch.set("StreamersOnline", this.streamersOnline)
        await Database.Cache.Twitch.set("StreamersOffline", this.streamersOffline)
        return setTimeout(() => this.refreshStreamersCache(false), 1000 * 5)
    }

    async saveChannelsNotified(initial = false): Promise<NodeJS.Timeout> {

        if (initial)
            for await (const streamer of this.streamers) {
                if (this.tempCache[streamer]?.length) {
                    await Database.Cache.Twitch.set(`channelsNotified.${streamer}`, this.tempCache[streamer])
                    delete this.tempCache[streamer]
                    continue
                }
            }

        return setTimeout(() => this.saveChannelsNotified(true), 1000 * 10)

    }

    async fetcher<T = unknown>(url: string | undefined): Promise<"TIMEOUT" | [] | undefined | T> {

        if (!url || !this.TwitchAccessToken) return

        return new Promise(resolve => {

            this.rateLimit.remaining--
            if (
                this.rateLimit.inCheck
                || this.rateLimit.remaining < 70
            ) {
                this.checkRatelimit(this.rateLimit.remaining)
                return resolve("TIMEOUT")
            }

            let timedOut = false
            const timeout = setTimeout(() => {
                timedOut = true
                return resolve([])
            }, 2000)

            fetch(url, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${this.TwitchAccessToken}`,
                    "Client-Id": `${env.TWITCH_CLIENT_ID}`
                }
            })
                .then(res => {
                    if (timedOut) return
                    clearTimeout(timeout)

                    if (res.status == 429 || this.rateLimit.inCheck) // Rate limit exceeded
                        return resolve("TIMEOUT")

                    this.rateLimit.MaxLimit = Number(res.headers.get("ratelimit-limit"))
                    const remaining = Number(res.headers.get("ratelimit-remaining"))

                    if (remaining >= 70)
                        this.rateLimit.remaining = Number(res.headers.get("ratelimit-remaining"))

                    if (this.rateLimit.remaining < 70)
                        this.checkRatelimit(this.rateLimit.remaining)

                    if (res.status == 400) { // Bad Request
                        console.log("BAD REQUEST TWITCH MANAGER - At Fetcher Function 1", url)
                        return resolve([])
                    }

                    return res.json()
                })
                .then(res => {

                    if (!res) return

                    if (res.status == 401) { // Unauthorized                         
                        console.log("TWITCH BAD REQUEST - At Fetcher Function 2", res, url)
                        return resolve([])
                    }

                    if (res.message == "invalid access token") {
                        this.renewToken(false)
                        return resolve([])
                    }

                    if (url.includes("/followers")) return resolve(res.total)
                    return resolve(res.data || [])
                })
                .catch(err => {
                    clearTimeout(timeout)
                    resolve([])

                    if (
                        [
                            "UND_ERR_CONNECT_TIMEOUT"
                        ].includes(err?.code || err?.data?.code)
                    )
                        return

                    console.log("TWITCH MANAGER FETCH ERROR - At Fetcher Function 3", err, url)
                    return resolve([])
                })
        })
    }

    async checkRatelimit(remaining: number) {

        if (remaining > 780) {
            this.rateLimit.inCheck = false
            return
        }

        if (this.rateLimit.inCheck) return
        this.rateLimit.inCheck = true

        const check = await this.check()
        if (check) return

        const interval = setInterval(async () => {
            const check = await this.check()
            if (check) {
                this.rateLimit.inCheck = false
                clearInterval(interval)
                return
            }
        }, 1000 * 5)
        return
    }

    async check(): Promise<boolean> {

        return await fetch("https://api.twitch.tv/helix/users?login=alanzoka", { // Top One of Brazil
            method: "GET",
            headers: {
                Authorization: `Bearer ${this.TwitchAccessToken}`,
                "Client-Id": `${env.TWITCH_CLIENT_ID}`
            }
        })
            .then(res => {
                this.rateLimit.remaining = Number(res.headers.get("ratelimit-remaining"))
                console.log("CHECKING - Check Rate Limit Function", this.rateLimit.remaining)
                if (this.rateLimit.remaining > (this.rateLimit.MaxLimit - 20))
                    this.rateLimit.inCheck = false

                return this.rateLimit.remaining > (this.rateLimit.MaxLimit - 20)
            })
            .catch(err => {

                if (
                    [
                        "UND_ERR_CONNECT_TIMEOUT"
                    ].includes(err?.code)
                )
                    return false

                console.log("TWITCH MANAGER FETCH ERROR - Check Rate Limit Function", err)
                return false
            })
    }

    async offlineStreamers(streamers: any[] | undefined) {
        if (!Array.isArray(streamers)) return

        const cached = await Database.Cache.Twitch.get("StreamersOffline")

        this.streamersOffline = Array.from(new Set([...cached, ...streamers].flat())).filter(i => i)

        await Database.Cache.Twitch.set("StreamersOffline", this.streamersOffline)

        if (
            streamers.some(
                streamer => this.streamersOnline.includes(streamer)
                    || this.channelsNotified[streamer]?.length > 0
            )
        ) this.notifyAndSetOfflineStreamer(streamers)

        return
    }

    async onlineStreamers(streamersStatus: StreamData[]) {
        if (!Array.isArray(streamersStatus) || !streamersStatus?.length) return

        const streamersData = await this.fetcher<UserData[]>(`https://api.twitch.tv/helix/users?${streamersStatus.map(data => `login=${data.user_login}`).join("&")}`)
        if (streamersData == "TIMEOUT" || !Array.isArray(streamersData) || !streamersData?.length) return

        const oldOfflineMembers = await Database.Cache.Twitch.pull("StreamersOffline", str => streamersStatus.some(d => d.user_login == str))
        this.streamersOffline = oldOfflineMembers
        const onlineMembers = Array.from(new Set([...this.streamersOnline, ...streamersStatus.map(d => d.user_login)].flat())).filter(i => i)
        await Database.Cache.Twitch.set("StreamersOnline", onlineMembers)
        this.streamersOnline = onlineMembers

        for (const data of streamersStatus) {
            const streamerData: any = streamersData?.find(d => d?.login == data.user_login)
            if (!streamerData) continue
            data.profile_image_url = streamerData?.profile_image_url as string || undefined
            data.display_name = streamerData?.display_name as string || undefined
            this.notifyAllChannels(data)
            continue
        }
        return
    }

    async notifyAndSetOfflineStreamer(streamers: string[]) {

        this.streamersOnline = Array.from(
            new Set(
                await Database.Cache.Twitch.pull("StreamersOnline", (str: string | null) => [...streamers, null].includes(str)) as string[] | undefined
            )
        ).flat().filter(i => i)

        await Database.Cache.Twitch.push("StreamersOnline", ...streamers)
        const notifiedChannels = await Database.Cache.Twitch.get("channelsNotified") || {}
        const streamersToNotifier: OfflineStreamersToNotifier[] = []

        for (const streamer of streamers)
            if (this.channelsNotified[streamer]?.length) {
                if (!this.data[streamer]) this.data[streamer] = []
                this.data[streamer].push(...this.channelsNotified[streamer])
                notifiedChannels[streamer] = []
                streamersToNotifier.push({ streamer, channels: Array.from(new Set(this.channelsNotified[streamer])).filter(i => i) })
                this.channelsNotified[streamer] = []
                continue
            }

        if (streamersToNotifier.length) this.notifyOfflineStreamersChannels(streamersToNotifier)
        await Database.Cache.Twitch.set("channelsNotified", notifiedChannels)
        return
    }

    async notifyOfflineStreamersChannels(offlineStreamers: OfflineStreamersToNotifier[]) {
        if (!Array.from(offlineStreamers) || !offlineStreamers?.length) return

        const request = await this.fetcher<UserData[]>(`https://api.twitch.tv/helix/users?${offlineStreamers.map(d => `login=${d.streamer}`).join("&")}`)
        if (request == "TIMEOUT" || !request?.length) return

        if (Array.from(request) && request.length)
            for (const { streamer, channels } of offlineStreamers) {

                const data = request.find(res => res.login == streamer)
                if (!data) continue
                const offlineImage = data?.offline_image_url || null

                for (const channelId of channels)
                    messagesToSend.push({
                        data: {
                            method: "post",
                            channelId,
                            isTwitchNotification: true,
                            content: offlineImage ? null : `<a:bell:1066521641422700595> | **${streamer}** não está mais online.`,
                            embeds: offlineImage
                                ? [{
                                    color: 0x9c44fb, /* Twitch's Logo Purple */
                                    author: {
                                        name: `${data.display_name || streamer} não está mais online.`,
                                        icon_url: data.profile_image_url as string,
                                        url: `https://www.twitch.tv/${streamer}`
                                    },
                                    image: { url: offlineImage },
                                    footer: {
                                        text: "Saphire Moon's Twitch Notification System [API]",
                                        icon_url: "https://freelogopng.com/images/all_img/1656152623twitch-logo-round.png",
                                    }
                                }]
                                : [],
                            components: <any[]>[{
                                type: 1,
                                components: [{
                                    type: 2,
                                    label: `Mais lives de ${streamer}`.slice(0, 80),
                                    emoji: parseEmoji("🎬"),
                                    custom_id: JSON.stringify({ c: "twitch", src: "oldLive", streamerId: data.id }),
                                    style: ButtonStyle.Primary
                                }]
                            }]
                        }
                    })

            }
        return
    }

    notifyAllChannels(data: StreamData) {
        const streamer = data?.user_login
        const channelsId = this.data[streamer] || []
        if (!data || !streamer || !channelsId?.length) return

        if (!this.channelsNotified[streamer]?.length) this.channelsNotified[streamer] = []
        this.data[streamer] = this.data[streamer].filter(cId => !this.channelsNotified[streamer]?.includes(cId))
        this.channelsNotified[streamer]?.push(...this.data[streamer])

        const game = data.game_name ? `${data.game_name} \`${data.game_id}\`` : "Nenhum jogo foi definido"
        const avatar = data.profile_image_url
        const viewers = `\`${this.num(data?.viewer_count || 0)}\``
        const imageUrl = data.thumbnail_url?.replace("{width}x{height}", "620x378") || null
        const url = `https://www.twitch.tv/${streamer}`
        const messageDefault = `**${data.display_name}** está em live na Twitch.`
        const date = new Date(data.started_at)
        const alreadySended = <string[]>[]

        if (!this.tempCache[streamer]) this.tempCache[streamer] = []

        for (const channelId of this.data[streamer]) {

            if (alreadySended.includes(channelId)) continue
            alreadySended.push(channelId)

            let content = undefined
            let role = undefined

            if (this.rolesIdMentions[`${streamer}_${channelId}`] && !this.customMessage[`${streamer}_${channelId}`])
                role = `<@&${this.rolesIdMentions[`${streamer}_${channelId}`]}>, ${messageDefault}`

            if (this.customMessage[`${streamer}_${channelId}`]?.length)
                content = this.customMessage[`${streamer}_${channelId}`]

            this.notifications++
            this.notificationInThisSeason++

            messagesToSend.push({
                data: {
                    method: "post",
                    isTwitchNotification: true,
                    channelId,
                    content: content || role || `<a:bell:1066521641422700595> | ${messageDefault}`,
                    embeds: [{
                        color: 0x9c44fb, // Twitch's Logo Purple
                        title: data.title?.slice(0, 256) || "Nenhum título foi definido",
                        author: {
                            name: data.user_name || "??",
                            icon_url: avatar,
                            url
                        },
                        url,
                        thumbnail: { url: avatar as string },
                        description: `📺 Transmitindo **${game}**\n👥 ${viewers} pessoas assistindo agora`,
                        fields: [
                            {
                                name: "📝 Adicional",
                                value: `⏳ Está online ${time(date, "R")}\n🗓️ Iniciou a live: ${this.datecomplete(data.started_at)}\n⏱️ Demorei \`${this.stringDate(Date.now() - date?.valueOf())}\` para enviar esta notificação\n🏷️ Tags: ${data.tags?.map((tag: string) => `\`${tag}\``)?.join(", ") || "Nenhuma tag"}\n🔞 +18: ${data?.is_mature ? "Sim" : "Não"}\n💬 Idioma: ${this.getTwitchLanguages(data?.language)}`
                            }
                        ],
                        image: { url: imageUrl as string },
                        footer: {
                            text: "Saphire Moon's Twitch Notification System [API]",
                            icon_url: "https://freelogopng.com/images/all_img/1656152623twitch-logo-round.png"
                        }
                    }],
                    components: <any[]>[{
                        type: 1,
                        components: [{
                            type: 2,
                            label: "Liberar Clips",
                            emoji: parseEmoji("🔒"),
                            custom_id: JSON.stringify({ c: "twitch", src: "clips", streamerId: data.user_id }),
                            style: ButtonStyle.Primary
                        }]
                    }]
                }
            })
            continue
        }

        this.data[streamer] = this.data[streamer].filter(cId => !alreadySended.includes(cId)) || []
        this.tempCache[streamer] = Array.from(new Set([...alreadySended, ...this.channelsNotified[streamer]]))
        return
    }

    num(num: number): string {
        const numberFormated = `${Intl.NumberFormat("pt-BR", {
            currency: "BRL",
            style: "currency"
        }).format(num)}`

        return `${numberFormated.slice(3)}`.slice(0, -3)
    }

    datecomplete(ms: number | string): string {
        return `${time(new Date(ms), "D")} às ${time(new Date(ms), "T")}`
    }

    stringDate(ms: number) {

        if (!ms || isNaN(ms) || ms <= 0) return "0 segundo"

        const totalYears = ms / (365.25 * 24 * 60 * 60 * 1000)
        const date: Record<string, number> = {
            millennia: Math.trunc(totalYears / 1000),
            century: Math.trunc((totalYears % 1000) / 100),
            years: Math.trunc(totalYears % 100),
            months: 0,
            days: Math.trunc(ms / 86400000),
            hours: Math.trunc(ms / 3600000) % 24,
            minutes: Math.trunc(ms / 60000) % 60,
            seconds: Math.trunc(ms / 1000) % 60
        }

        if (date.days >= 30)
            while (date.days >= 30) {
                date.months++
                date.days -= 30
            }

        const timeSequency = ["millennia", "century", "years", "months", "days", "hours", "minutes", "seconds"]
        let result = ""

        const translate: Record<string, (n: number) => string> = {
            millennia: (n: number) => n == 1 ? "milênio" : "milênios",
            century: (n: number) => n == 1 ? "século" : "séculos",
            years: (n: number) => n == 1 ? "ano" : "anos",
            months: (n: number) => n == 1 ? "mês" : "meses",
            days: (n: number) => n == 1 ? "dia" : "dias",
            hours: (n: number) => n == 1 ? "hora" : "horas",
            minutes: (n: number) => n == 1 ? "minuto" : "minutos",
            seconds: (n: number) => n == 1 ? "segundo" : "segundos"
        }

        for (const time of timeSequency)
            if (date[time] > 0)
                result += `${date[time]} ${translate[time](date[time])} `

        return result?.trim()
    }

    getTwitchLanguages(str: string | undefined) {
        return TwitchLanguages[str as keyof typeof TwitchLanguages] || "Indefinido"
    }

    removeChannel({ streamer, channelId }: RemoveChannelParams) {
        if (!streamer || !channelId) return

        if (this.data[streamer]?.includes(channelId))
            this.data[streamer] = this.data[streamer]?.filter(id => id != channelId)

        if (this.channelsNotified[streamer]?.includes(channelId))
            this.channelsNotified[streamer] = this.channelsNotified[streamer]?.filter(id => id != channelId)

        return
    }

    async setCounter() {

        if (this.notificationInThisSeason > 0)
            await Database.Client.updateOne(
                { id: env.SAPHIRE_BOT_ID },
                { $inc: { TwitchNotifications: this.notificationInThisSeason } }
            )

        this.notificationInThisSeason = 0
        setTimeout(() => this.setCounter(), 1000 * 30)
        return
    }

    async updateStreamer({ streamer, channelId, guildId }: UpdateStreamerParams, callback: CallbackType) {

        if (!streamer || !guildId || !channelId) return
        let dataFromDatabase = (await redis.json.get(guildId) as any) as GuildSchema | undefined;

        if (!dataFromDatabase) {
            const data = await Database.Guild.findOne({ id: guildId });
            set(data?.id, data?.toObject());
            if (data) dataFromDatabase = data;
        }

        const notifications = dataFromDatabase?.TwitchNotifications || []
        const has = dataFromDatabase?.TwitchNotifications?.some(d => d?.streamer == streamer && d?.channelId == channelId)
        if (has) return callback("already")

        const oldChannelId = notifications.find(d => d?.channelId == channelId)?.channelId
        const data = notifications
            .filter(d => d?.streamer != streamer || (d?.channelId == oldChannelId && d?.streamer == streamer))

        data.push({ streamer, channelId })

        await Database.Guild.updateOne(
            { id: guildId },
            { $set: { TwitchNotifications: data } },
            { upsert: true }
        )

        this.toCheckStreamers.push(streamer)
        if (!this.streamers.includes(streamer)) this.streamers.push(streamer)
        if (!this.data[streamer]) this.data[streamer] = []
        if (!this.channelsNotified[streamer]) this.channelsNotified[streamer] = []

        const indexData = this.data[streamer].findIndex(cId => cId == oldChannelId)
        if (indexData < 0) this.data[streamer].push(channelId)
        else this.data[streamer].splice(indexData, 1, channelId)

        const indexNotified = this.channelsNotified[streamer]?.findIndex(cId => cId == oldChannelId)
        if (indexNotified >= 0) this.channelsNotified[streamer].splice(indexNotified, 1)
        await Database.Cache.Twitch.set(`channelsNotified.${streamer}`, this.channelsNotified[streamer])
        return callback("success")
    }

    async updateManyStreamer({ streamer, channelId, roleId, message, oldChannelId }: UpdateManyStreamerParams) {
        if (!streamer || !channelId) return
        this.streamersOffline.push(streamer)

        if (!this.toCheckStreamers.includes(streamer)) this.toCheckStreamers.push(streamer)
        if (!this.streamers.includes(streamer)) this.streamers.push(streamer)
        if (!this.data[streamer]) this.data[streamer] = []
        if (!this.channelsNotified[streamer]) this.channelsNotified[streamer] = []

        const index = this.data[streamer].findIndex(cId => cId == oldChannelId)
        if (index >= 0) this.data[streamer].splice(index, 1)
        this.data[streamer].push(channelId)

        if (!this.channelsNotified[streamer]) this.channelsNotified[streamer] = []
        const indexNotified = this.channelsNotified[streamer]?.findIndex(cId => cId == oldChannelId) || -1
        if (indexNotified >= 0) this.channelsNotified[streamer].splice(index, 1)

        await Database.Cache.Twitch.pull(`channelsNotified.${streamer}`, (cId: string) => cId == oldChannelId)
        if (roleId) this.rolesIdMentions[`${streamer}_${channelId}`] = roleId
        if (message) this.customMessage[`${streamer}_${channelId}`] = message
        return
    }

}