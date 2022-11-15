import { Stream } from "node:stream";
import { APIAttachment, APIEmbed, Attachment, AttachmentBuilder, AttachmentPayload, BufferResolvable, JSONEncodable, WebhookClient } from "discord.js";
import { FastifyReply } from "fastify";

export default async (
    { url, username, avatarURL, content, embeds, files }:
        {
            url: string,
            username?: string,
            avatarURL?: string,
            content?: string,
            embeds?: APIEmbed[],
            files?: (
                | Stream
                | BufferResolvable
                | JSONEncodable<APIAttachment>
                | Attachment
                | AttachmentBuilder
                | AttachmentPayload
            )[]
        },
    res?: FastifyReply
) => {

    if (!url) return

    const webhook = new WebhookClient({ url })
    if (!webhook) return

    return webhook.send({ username, avatarURL, content, embeds, files })
        .then(() => res?.status(200).send("Ok"))
        .catch(error => res
            ?.status(500)
            ?.send({ response: "Error to execute the sender", error })
        )

}