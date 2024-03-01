import { MercadoPagoConfig, Payment } from "mercadopago";
import { env } from "process";
export const accessToken = getAccessToken();

export const Client = new MercadoPagoConfig({
  accessToken: accessToken
});

export const Pay = new Payment(Client);

function getAccessToken() {
  return env.MACHINE === "localhost"
    ? env.MERCADO_PAGO_TEST_ACCESS_TOKEN
    : env.MERCADO_PAGO_PRODUCTION_ACCESS_TOKEN
}