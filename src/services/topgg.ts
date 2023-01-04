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

  const { user } = <TopGGWebhookPostResult>req.body

  if (!/(\d{17,})/.test(user))
    return res
      .status(406)
      .send("Content is not acceptable");

  return request(env.ROUTE_SAPHIRE_TOP_GG || "", {
    method: "POST",
    headers: {
      user,
      authorization: env.TOP_GG_AUTHORIZATION
    }
  })
    .then(result => {

      if (!result)
        return res
          .status(200)
          .send("It's ok, but it didn't announce.")

      sender({
        url: env.WEBHOOK_TOP_GG_COUNTER as string,
        avatarURL: result.headers.avatarURL as string,
        username: result.headers.username as string,
        content: result.headers.content as string
      }, res)
        .then(() => res.status(200).send("Ok"))

    })
    .catch(err => {
      console.log(res)
      return res
        .status(500)
        .send(err || "Internal Server Error Not Found")
    })
})