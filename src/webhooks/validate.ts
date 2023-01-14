import { env } from "node:process";
import { WebhookBodyRequest } from "../@types";
import server from "../server";
import sender from "./sender";

server.post("/sender", async (req, res) => {
  const { webhookUrl: url, content, embeds, avatarURL, files, username } = <WebhookBodyRequest>req.body;

  if (req.headers?.authorization !== env.WEBHOOK_ACCESS)
    return res
      .status(401) // Unauthorized
      .send("Unauthorized");

  if (!url)
    return res
      .status(204) // No Content
      .send({ status: "Unknown Webhook URL" });

  if (!content && (!embeds || !Array.isArray(embeds)))
    return res
      .status(204) // No Content
      .send({ status: "Unknown Content and Embeds" });

  if (content && typeof content !== "string")
    return res
      .status(406) // Not Acceptable
      .send({ status: "Content is not string" });

  return sender({ url, username, avatarURL, content, embeds, files }, res)
    .then(() => res.status(200).send("Ok"))
    .catch(err => res
      .status(500) // Internal Server Error
      .send({ response: "An error ocurred", error: err })
    );

});