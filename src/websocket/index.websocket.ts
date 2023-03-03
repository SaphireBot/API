import { wss } from "../server";
import socket from "./socket.websocket";

wss.once("listening", () => console.log("Websocket System Started"))

wss.on("connection", (WebSocket, request) => socket(WebSocket, request));

wss.on("error", error => console.log(error))