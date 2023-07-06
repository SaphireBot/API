import express from "express";
import { Server } from "ws";
import { createServer } from "node:http";

const server = express()
server.use(express.json())
server.disable("x-powered-by");
const httpServer = createServer(server)
const ws = new Server({ server: httpServer })

export { server, httpServer, ws }