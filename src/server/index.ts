import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const server = express()
server.use(express.json())
server.disable("x-powered-by");
server.use(cors({ methods: "GET,POST,DELETE" }))

const httpServer = createServer(server)
const ws = new Server(httpServer)

export { server, httpServer, ws }