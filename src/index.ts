import "dotenv/config"
import fastify from "fastify";
import topGGHandler from "./services/topgg";

const app = fastify();

app.post("/topgg", topGGHandler);

app.get("/", (_, res) => {
  return res.status(200).send({ status: "Saphire's API Online" });
});

app.get("/connections", (req, res) => {
  return res.send(req.headers)
});

app.listen({
  port: 8080,
  host: "0.0.0.0"
}, (err) => err
  ? console.log(err)
  : console.log("Saphire's API Connected")
);
