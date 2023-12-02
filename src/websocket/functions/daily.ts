import { env } from "process";
import { CallbackType } from "../../@types";
import database, { redis } from "../../database";
import { get, set } from "../cache/get.cache";
import { Response } from "express";
const dailyCooldown = new Set();

const prizes = {
    1: { day: 1, money: 200, xp: 150 },
    2: { day: 2, money: 0, xp: 3000 },
    3: { day: 3, money: 300, xp: 100 },
    4: { day: 4, money: 400, xp: 4000 },
    5: { day: 5, money: 500, xp: 250 },
    6: { day: 6, money: 600, xp: 350 },
    7: { day: 7, money: 7000, xp: 7000 },
    8: { day: 8, money: 800, xp: 150 },
    9: { day: 9, money: 900, xp: 150 },
    10: { day: 10, money: 1000, xp: 1050 },
    11: { day: 11, money: 350, xp: 700 },
    12: { day: 12, money: 570, xp: 750 },
    13: { day: 13, money: 800, xp: 1250 },
    14: { day: 14, money: 14000, xp: 14000 },
    15: { day: 15, money: 200, xp: 150 },
    16: { day: 16, money: 200, xp: 150 },
    17: { day: 17, money: 1210, xp: 1150 },
    18: { day: 18, money: 1500, xp: 0 },
    19: { day: 19, money: 1500, xp: 9000 },
    20: { day: 20, money: 1000, xp: 150 },
    21: { day: 21, money: 3500, xp: 150 },
    22: { day: 22, money: 7500, xp: 150 },
    23: { day: 23, money: 1000, xp: 2000 },
    24: { day: 24, money: 2000, xp: 3000 },
    25: { day: 25, money: 3000, xp: 4000 },
    26: { day: 26, money: 5000, xp: 5000 },
    27: { day: 27, money: 6000, xp: 6000 },
    28: { day: 28, money: 7000, xp: 7000 },
    29: { day: 29, money: 8000, xp: 8000 },
    30: { day: 30, money: 9000, xp: 9000 },
    31: { day: 31, money: 30000, xp: 1000 }
};

export default async function daily({ userId, guilds, access_token }: { userId: string, guilds: any[], access_token: string }, res: CallbackType | Response) {

    function callback(data: any) {
        if ("send" in res) return res.send(data);
        return res(data);
    }

    if (!userId || typeof userId !== "string" || !Array.isArray(guilds)) return callback("<p>Os parametros repassados não estão completos, por favor, contacte alguém da minha equipe.</p>");
    if (dailyCooldown.has(userId))
        return callback("<p>Você está tentando fazer isso rápido demais, sabia?</p>");
    dailyCooldown.add(userId);
    setTimeout(() => dailyCooldown.delete(userId), 2000);
    let data = await get(userId);

    if (!data) {
        data = (await database.User.findOne({ id: userId })) || { id: userId };
        set(userId, ("toObject" in data) ? data?.toObject() : data)
    }

    if (!data?.Tokens?.access_token)
        return callback("<p>Parece que seus dados estão incompletos no seu banco de dados, você pode fazer login no site? Para mim, você é um completo desconhecido</p>");

    if (data?.Tokens?.access_token !== access_token)
        return callback("<p>Qual foi, esse perfil não é seu, sabia?</p>");

    const count = (data?.DailyCount || 0) + 1;
    const timeout = data?.Timeouts?.Daily || 0;
    const oneDayInMilliseconds = 1000 * 60 * 60 * 24;
    const dateNow = Date.now();

    if (86400000 - (dateNow - (timeout || 0)) > 0)
        return callback(`<p>Você ainda não pode pegar o seu prêmio diário, tenta de novo nessa data;<br/>${Intl.DateTimeFormat("pt-BR", { dateStyle: "full", timeStyle: "medium" }).format(new Date(timeout + oneDayInMilliseconds))}</p>`);

    let client = (await redis.json.get(env.SAPHIRE_BOT_ID) as any) as any;
    if (!client) client = await database.Client.findOne({ id: env.SAPHIRE_BOT_ID });

    let html = "";

    const isVip = data?.Vip?.Permanent || (data?.Vip?.TimeRemaing || 0) - (dateNow - (data?.Vip?.DateNow || 0)) > 0;
    const prize: { day: number, money: number, xp: number } = Object.assign(
        {},
        prizes[count as keyof typeof prizes] || {
            day: count,
            money: parseInt(Math.floor(Math.random() * 10000).toFixed(0)),
            xp: parseInt(Math.floor(Math.random() * 10000).toFixed(0))
        }
    );
    const money = prize.money;
    const xp = prize.xp;

    if (guilds?.some((g: any) => g?.id === "952214872584749056")) {
        const res = bonusCalculate(0.5);
        html += `<p>[Servidor Principal] +${res.money} Safiras & +${res.xp} Experiências</p>`;
    }

    if (isVip) {
        const res = bonusCalculate(0.7);
        html += `<p>[VIP] +${res.money} Safiras & +${res.xp} Experiências</p>`;
    }

    if (client?.Titles?.BugHunter?.includes(userId)) {
        const res = bonusCalculate(0.3);
        html += `<p>[BUG HUNTER] +${res.money} Safiras & +${res.xp} Experiências</p>`;
    }

    for (const guild of guilds)
        if (client?.PremiumServers?.includes(guild?.id)) {
            const res = bonusCalculate(0.3);
            html += `<p>[SERVER PREMIUM - ${guild.name}] +${res.money} Safiras & +${res.xp} Experiências</p>`;
        }

    if (
        (count > 0 && timeout > 0)
        && !(timeout - (dateNow - oneDayInMilliseconds) > 0)
    ) {
        await database.User.updateOne(
            { id: userId },
            {
                $unset: {
                    "Timeouts.Daily": true,
                    DailyCount: true
                }
            },
            { upsert: true }
        );
        html += `<p>Você perdeu a sequência diária de ${count} dias</p>`;
        prize.day = 1;
    }

    html += `<p>No seu ${prize.day}° dia, você recebeu ${prize.money} Safiras e ${prize.xp} Experiências</p>`;

    const uerData = await database.User.findOneAndUpdate(
        { id: userId },
        {
            $set: { "Timeouts.Daily": dateNow },
            $inc: {
                DailyCount: 1,
                Balance: prize.money,
                Xp: prize.xp
            },
            $push: {
                Transactions: {
                    $each: [
                        {
                            createdAt: new Date(),
                            keywordTranslate: "daily.transactions.claimmed",
                            method: "add",
                            mode: "daily",
                            type: "gain",
                            value: prize.money,
                            userIdentify: `${count}`
                        }],
                    $position: 0
                }
            }
        },
        { upsert: true, new: true }
    );
    set(userId, uerData?.toObject());
    return callback(html);

    function bonusCalculate(porcent: number) {
        const moneyToAdd = parseInt(Math.floor(money * porcent).toFixed(0));
        const xpToAdd = parseInt(Math.floor(xp * porcent).toFixed(0));
        prize.money += moneyToAdd;
        prize.xp += xpToAdd;
        return { money: moneyToAdd, xp: xpToAdd };
    }
}