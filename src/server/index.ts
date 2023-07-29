import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const server = express()
server.use(express.json())
server.disable("x-powered-by");
server.use(cors())

// server.use((_, res, next) => {
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.setHeader("Access-Control-Allow-Headers", "*");
//     res.setHeader("Access-Control-Allow-Credentials", 1);
//     res.setHeader("Access-Control-Allow-Methods", "GET");
//     res.setHeader("Access-Control-Max-Age", 3600);
//     res.setHeader("Cache-Control", "no-store, no-cache");
//     next();
// });

const httpServer = createServer(server)
const ws = new Server(httpServer)

export { server, httpServer, ws }