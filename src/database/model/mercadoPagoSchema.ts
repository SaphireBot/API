import { Schema, InferSchemaType, Types } from "mongoose";

export const MercadoPagoPaymentSchema = new Schema({
  id: { type: Number, unique: true },
  date_created: String,
  date_approved: String,
  date_last_updated: String,
  date_of_expiration: String,
  operation_type: String,
  issuer_id: String,
  status: String,
  status_detail: String,
  currency_id: String,
  description: String,
  taxes_amount: Number,
  payer: {
    email: String,
    first_name: String,
    last_name: String,
  },
  metadata: {
    guild_id: String,
    user_id: String,
    message_id: String,
    channel_id: String,
  },
  transaction_amount: Number,
  transaction_amount_refunded: Number,
  transaction_details: Object,
  point_of_interaction: {
    transaction_data: {
      qr_code: String,
      qr_code_base64: String,
      transaction_id: String,
      bank_transfer_id: Number,
      financial_institution: Number,
      bank_info: Object,
      ticket_url: String,
    }
  },
  taxes: Object,
  fee_details: [Object]
});

export type MercadoPagoPaymentSchemaType = InferSchemaType<typeof MercadoPagoPaymentSchema> & { _id: Types.ObjectId };