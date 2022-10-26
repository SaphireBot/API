import fastifyWebSocket from "@fastify/websocket";
import fastify from "fastify";
import { topggWebhook } from "./services";

const app = fastify();

app.register(fastifyWebSocket);

app.get("/ws", { websocket: true }, (connection) => {
  console.log("Linha 10");

  connection.socket.on("message", () => {
    console.log("Linha 13");
    connection.socket.send("Hello World!");
  });
});

app.get("/topgg", { websocket: true }, (connection) => {
  topggWebhook.listener((vote) => {
    console.log(`TopGG - ${vote}`);
    connection.socket.send(vote);
  });
});

app.get("/", (_, res) => {
  return res.status(200).send({ status: "Online" });
});

app.get("/saphire", (_, res) => {
  return res.status(200).send("OK");
});

app.listen({ port: 8080 }, (err, address) => console.log(200, err ?? address));
