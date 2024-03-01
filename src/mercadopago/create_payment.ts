import { server } from "../server";
import { CreateRequestPayment } from "./types";
import Timer from "./timer";
import { Pay, accessToken } from "./util";
import Database from "../database";

server.post("/payments", async (req, res) => {

  if (req.headers.authorization !== accessToken)
    return res.status(401).json({ message: "Unauthorized" });

  const body = req.body as CreateRequestPayment | undefined;

  if (
    !body
    || typeof body !== "object"
    || Object.keys(body).length !== 7
  )
    return res.status(400).json({ message: "Bad Request" });

  const { amount, channel_id, email, guild_id, message_id, user_id, username } = body;

  if (Timer.has(body.user_id))
    return res.status(429).json({ message: "Too Many Requests" });

  if (
    typeof amount !== "number"
    || typeof channel_id !== "string"
    || typeof email !== "string"
    || typeof guild_id !== "string"
    || typeof message_id !== "string"
    || typeof user_id !== "string"
    || typeof username !== "string"
  )
    return res.status(400).json({ message: "Bad Property Type Request" });

  Timer.set(user_id);

  const exists = await Database.Payments.findOne({ "metadata.user_id": user_id });

  if (exists)
    return res.status(406).json({
      message: "An payment is already open",
      data: exists.toJSON()
    });

  const date_of_expiration = (() => {
    const date = new Date();
    date.setHours(date.getHours() + 1);
    date.setMinutes(date.getMinutes() + 10);
    return date.toISOString();
  })();

  const pay = await Pay.create({
    body: {
      payment_method_id: "pix",
      installments: 1,
      transaction_amount: Number(`${amount.toFixed(2)}`),
      date_of_expiration,
      payer: {
        first_name: username,
        email: email
      },
      metadata: {
        guild_id,
        channel_id,
        user_id,
        message_id
      }
    }
  })
    .catch(error => {
      console.log(error);
      return { message: "Mercado Pago SDK Error", error: `${error?.message}` };
    })

  if ("error" in pay && "message" in pay)
    return res.status(500).json(pay)

  const data = await Database.Payments.create(Object.assign({}, pay))
    .then(res => ({ message: "[Mongoose] Data saved.", data: res.toJSON() }))
    .catch(error => ({ message: "[Mongoose] Error to save payment", error }));

  return res
    .status("error" in data ? 500 : 201)
    .json(data);
})