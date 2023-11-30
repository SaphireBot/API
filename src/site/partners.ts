import { Request, Response } from "express";
import { partners } from "../websocket/connection";

export default (_: Request, res: Response) => res.send(partners);