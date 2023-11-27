import { ws } from "../server";
import connection from "./connection";

ws
    .on("connection", connection);