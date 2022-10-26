import fastify from "fastify";
const app = fastify();

app.get("/", (_, res) => {
  return res
    .status(200)
    .send({ status: "Online" });
})

app.listen({
  port: 8080,
}, () => console.log("Saphire's API Connected"))