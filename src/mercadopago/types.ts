import { PaymentResponse } from "mercadopago/dist/clients/payment/commonTypes"

export interface Payment extends PaymentResponse {
 metadata: Metadata
}

export interface Metadata {
  guild_id: string
  user_id: string
  message_id: string
  channel_id: string
}

export interface WebhookNotification {
  action: "payment.created" | "payment.updated"
  api_version: string
  data: { id: number }
  date_created: string
  id: number
  live_mode: boolean
  type: "payment"
  user_id: string
}

export interface CreateRequestPayment {
  guild_id: string
  user_id: string
  channel_id: string
  message_id: string
  username: string
  email: string
  amount: number
}