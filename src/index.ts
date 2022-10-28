import "dotenv/config";
import server from "./server";
import "./services";
import "./webhooks";

server.get("/", (_, res) => res.status(200).send({ status: "Saphire's API Online" }));
server.get("/connections", (_, res) => res.send("https://discord.gg/2EMVCbJxuC"));

server.listen({
  port: 8080,
  host: "0.0.0.0"
}, (err) => err
  ? console.log(err)
  : console.log("Saphire's API Connected")
);
