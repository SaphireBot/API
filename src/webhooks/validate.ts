import { env } from "node:process";
import { WebhookBodyRequestBody } from "../@types";
import server from "../server";
import sender from "./sender";

server.post("/sender", async (req, res) => {
  const { url, content, embeds, avatarURL, files, username } = <WebhookBodyRequestBody>req.body

  if (req.headers?.authorization !== env.WEBHOOK_ACESS)
    return res
      .status(401) // Unauthorized
      .send("Unauthorized");

  if (!url)
    return res
      .status(204) // No Content
      .send({ status: "Unknown Webhook URL" })

  if (!content && (!embeds || embeds.length === 0))
    return res
      .status(204) // No Content
      .send({ status: "Unknown Content and Embeds" })

  if (typeof content != "string")
    return res
      .status(406) // Not Acceptable
      .send({ status: "Embeds is not an array" })

  return sender({ url, username, avatarURL, content, embeds, files }, res)
    .then(() => res.status(200).send("Ok"))
    .catch(err => res
      .status(500) // Internal Server Error
      .send({ response: "An error ocurred", error: err })
    );

});