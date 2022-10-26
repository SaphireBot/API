import fastify from "fastify";
const app = fastify();

app.get("/", (req, res) => {
  return res.send({ status: "ok" });
})

app.listen({
  port: 8080,
})