import express from "express"
import { WebSocketServer } from "ws"
import { createServer } from "node:http"

const server = express()
server.use(express.json())
server.disable("x-powered-by");
const httpServer = createServer(server)
const wss = new WebSocketServer({ server: httpServer })

export { server, wss, httpServer }