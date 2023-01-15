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

  const { user } = req.body as TopGGWebhookPostResult
  await request(env.ROUTE_SAPHIRE_TOP_GG || "", {
    method: "POST",
    headers: { user, authorization: env.TOP_GG_AUTHORIZATION }
  })
    .then(result => sender({
      url: env.WEBHOOK_TOP_GG_COUNTER as string,
      avatarURL: env.TOP_GG_WEBHOOK_AVATAR as string,
      username: "[API] Top GG Vote Notification",
      content: result.headers.content as string
    }, res))
    .catch(() => null)

  return res.status(200).send()
})