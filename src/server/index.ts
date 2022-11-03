import fastify, { FastifyInstance } from "fastify";
// import cors from "@fastify/cors"

const server: FastifyInstance = fastify();

// (async () => {
//     await server.register(cors, {
//         origin: (origin, cb) => {
//             console.log(origin, cb)
//             const hostname = new URL(origin)?.hostname
//             if (hostname === "localhost") {
//                 //  Request from localhost will pass
//                 cb(null, true)
//                 return
//             }
//             // Generate an error on other origins, disabling access
//             cb(new Error("Not allowed"), false)
//         },
//         // allowedHeaders: "*",
//         // credentials: true,
//         // methods: ["GET", "POST"],
//         // maxAge: 3600
//     })
// })();

export default server;