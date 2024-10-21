import { server } from "../server";
import { Pay, accessToken } from "./util";
import Database from "../database";

server.delete("/payments", async (req, res): Promise<any> => {

  if (req.headers.authorization !== accessToken)
    return res.status(401).json({ message: "Unauthorized" });

  const userId = req.body?.user_id as string;

  if (!userId)
    return res.status(400).json({ message: "Bad Request" });

  try {

    const payment = await Database.Payments.findOneAndDelete({ "metadata.user_id": userId });

    if (!payment?.id)
      return res.status(404).json({ message: "Payment or Payment ID not found" });

    const response = await Pay.cancel({ id: payment.id })
      .catch(err => ({ message: "Error to cancel payment", error: err }));

    if ("error" in response)
      return res.status(500).json(response);

    return res.status(200).json({ message: "Payment deleted.", data: payment.toJSON() })

  } catch (err) {
    return res.status(500).json({ message: "Error to cancel payment", error: err });
  }

})