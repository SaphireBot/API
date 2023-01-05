import { env } from "node:process";
import { request } from "undici";
import { TopGGWebhookPostResult } from "../@types";
import server from "../server";
import sender from "../webhooks/sender";

server.post("/topgg", async (req, res) => {

  if (req.headers?.authorization !== env.TOP_GG_AUTHORIZATION)
    return res
      .status(401)
      .send("Authorization is not defined correctly.");

  // type: "upvote" | "test"
  const { user, bot, type } = req.body as TopGGWebhookPostResult

  if (!user || !bot || !type)
    return res.status(206).send("Content are missing")

  if (bot !== env.SAPHIRE_BOT_ID || type === "test")
    return res.status(200).send("Test OK")

  if (!/(\d{17,})/.test(user))
    return res
      .status(406)
      .send("Content is not acceptable");

  const webhookSended: number = await request(env.ROUTE_SAPHIRE_TOP_GG || "", {
    method: "POST",
    headers: {
      user,
      authorization: env.TOP_GG_AUTHORIZATION
    }
  })
    .then(result => {

      if (!result || !result.headers.content) {
        res
          .status(206)
          .send("It's ok, but it didn't announce.")
        return 206
      }

      sender({
        url: env.WEBHOOK_TOP_GG_COUNTER as string,
        avatarURL: env.TOP_GG_WEBHOOK_AVATAR as string,
        username: "[API] Top GG Vote Notification",
        content: result.headers.content as string
      }, res)

      return result.statusCode
    })
    .catch(err => {
      console.log(res)
      res
        .status(500)
        .send(err)

      return 500
    })

  if (webhookSended === 200)
    return res.status(200).send()

  return res.status(webhookSended).send()
})