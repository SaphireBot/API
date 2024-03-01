import { APIEmbed, APIMessage, Colors, Routes, codeBlock, time } from "discord.js";
import { Rest } from "..";
import { server } from "../server";
import { WebhookNotification, Payment } from "./types";
import Database from "../database";
import { randomUUID } from "crypto";
import { e } from "../json/data.json"
import { Pay } from "./util";
import { setTimeout as sleep } from "node:timers/promises";
const tries: Record<string, number> = {};

server.post("/webhook", async (req, res) => {

  const body = req.body as WebhookNotification;

  if (
    ![
      "payment.update",
      "payment.updated",
      "payment.create",
      "payment.created"
    ].includes(body.action)
    || body.type !== "payment"
  ) return;

  const response = await getDataAndRefreshEmbed(body?.data?.id);
  if (response) res.sendStatus(200);

});

async function getDataAndRefreshEmbed(paymentId: number, tryKey?: string): Promise<boolean> {
  if (!paymentId) return false;

  const key = tryKey || randomUUID();
  tries[key] = (tries[key] || 0) + 1;

  const payment = await Pay.get({ id: paymentId });
  if (payment) {

    ["cancelled", "approved"].includes(payment.status!)
      ? await Database.Payments.deleteOne({ id: paymentId })
      : await Database.Payments.updateOne(
        { id: paymentId },
        { $set: Object.assign({}, payment) },
        { upsert: true }
      )

    return await refreshEmbed(payment as Payment);
  }

  if (tries[key] > 5) {
    delete tries[key];
    return false;
  }

  await sleep(3000);
  return await getDataAndRefreshEmbed(paymentId, key);
}

async function refreshEmbed(data: Payment): Promise<boolean> {

  await sleep(2000);

  const { channel_id, message_id, user_id } = data.metadata;
  const { status, transaction_amount, point_of_interaction } = data;
  const pix = point_of_interaction?.transaction_data;

  const statusParse: string | undefined = {
    "pending": `${e.Loading} Esperando pagamento`,
    "approved": `${e.CheckV} Pagamento aprovado`,
    "authorized": `${e.CheckV} Pagamento autorizado`,
    "cancelled": `${e.DenyX} Pagamento cancelado`,
    "rejected": `${e.DenyX} Pagamento rejeitado`
  }[status!];

  if (!statusParse)
    console.log("statusParse", statusParse)

  if (!channel_id || !message_id) return false;

  const body = {
    content: null as string | null,
    embeds: [{
      color: Colors.Blue,
      title: `${e.Animated.SaphireReading} Saphire Moon QRCode`,
      description: `O QRCode abaixo é no valor de R$ ${transaction_amount}.\nApós o efetuar o pagamento, espere a confirmação.`,
      fields: [{
        name: "📡 Status",
        value: statusParse || `${e.Warn} Status indefinido`
      }],
      image: { url: "" },
      footer: {
        text: "Opção válida somente para o Brasil"
      }
    }] as APIEmbed[]
  } as { content: string | null, embeds: APIEmbed[], components: any[] | undefined, attachments: any[] | undefined };

  if (["pending", "authorized"].includes(status!)) {
    body.embeds[0]!.image!.url = "attachment://qrcode.png"
    const expirationDate = new Date(data.date_of_expiration!);
    expirationDate.setHours(expirationDate.getHours() - 1);
    body.embeds[0]!.fields!.push(
      ...[
        {
          name: "⏱️ Vencimento",
          value: `${time(expirationDate, "R")}`
        },
        {
          name: "🏷️ PIX Copia e Cola",
          value: codeBlock("txt", pix?.qr_code || "??")
        }
      ])
  }

  if (status === "approved") {
    body.embeds[0] = {
      color: Colors.Green,
      title: `${e.Animated.SaphireReading} Saphire Moon QRCode`,
      description: "Muito obrigado pela sua doação, você já recebeu suas recompensas.",
      fields: [{
        name: "📡 Status",
        value: statusParse || `${e.Warn} Status indefinido`
      }]
    }
    body.components = [];
    body.attachments = [];
    setPrizes(user_id, transaction_amount!);
  }

  if (["cancelled", "rejected"].includes(status!)) {
    body.content = `${e.DenyX} | Pagamento cancelado.`;
    body.embeds = [];
    body.components = [];
    body.attachments = [];
  }

  return await Rest.patch(
    Routes.channelMessage(channel_id, message_id),
    {
      headers: {
        "Content-Type": "application/json"
      },
      body
    }
  )
    .then(msg => {
      return typeof (msg as APIMessage)?.id === "string";
    })
    .catch(async () => {
      await Pay.cancel({ id: data.id! }).catch(() => { });
      await Database.Payments.deleteOne({ id: data.id! });
      return false;
    });
}

async function setPrizes(userId: string, value: number) {
  if (!userId || typeof value !== "number") return;
  const balance = parseInt(Number((value * value) * 1000).toFixed(0));

  await Database.User.updateOne(
    { id: userId },
    {
      $inc: {
        Balance: balance,
        Xp: balance * 2000,
      },
      $push: {
        Transactions: {
          $each: [{
            createdAt: new Date(),
            value: balance,
            type: "gain",
            method: "add",
            mode: "system",
            userIdentify: `**R$ ${value}**`,
            keywordTranslate: "mercadopago.transactions.approved"
          }],
          $position: 0
        }
      }
    },
    { upsert: true }
  );

  return;
}