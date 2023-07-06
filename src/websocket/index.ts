// import { WebSocket } from "ws";
// import { ws } from "../server";
// let test = 0

// ws.on("connection", socket => {

//     socket.send("[WEBSOCKET] Connected.")
//     checkAndKeepOnline(socket)

//     socket.on("message", message => {
//         if (!message) return
//         test += parseInt(message?.toString() || "0")
//         socket.send(test)
//     })


// })
//     .on("error", console.log)

// function checkAndKeepOnline(socket: WebSocket) {
//     const enigma = Math.floor(3000 * Math.random())
//     const interval = setInterval(() => socket.ping(enigma), 5000)

//     socket.on("pong", data => {
//         const number = Number(data.toString())

//         if ((enigma + 5) !== number) {
//             socket.close(undefined, "Who are you?")
//             clearInterval(interval)
//             return console.log("died", number)
//         }

//         return console.log("keepAlive", number)
//     })

//     return
// }


// console.log("Websocket System Ready")