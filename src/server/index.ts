import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const server = express()
server.use(express.json())
server.disable("x-powered-by");
const httpServer = createServer(server)
const ws = new Server(httpServer)

export { server, httpServer, ws }