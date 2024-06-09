import { Request, Response } from "express";
import database from "../database";
import { env } from "process";

export default async function commandBlocker(req: Request, res: Response) {

    const { body } = req;
    if (body?.method === "block") return await blockCommand(req, res);
    if (body?.method === "unblock") return await unblockCommand(req, res);
    if (body?.method === "unblockall") return await unblockallCommand(req, res);

    return res.send({ message: "Unknown Method" })
}

async function blockCommand(req: Request, res: Response) {

    const { body } = req;
    const { command, reason, userid } = body || {};

    if (Array.isArray(command)) return await blockMultiCommand(req, res);

    const clientData = await database.getClientData();

    if (!(clientData?.Administradores || []).includes(userid)) return res.send({ message: "Unauthorized" })
    if (!command || !reason || !userid) return res.send({ message: "missing data" });

    const blocked = (clientData?.BlockedCommands || []).find(cmd => cmd?.cmd === command);
    if (blocked) return res.send({
        message: "command is already blocked",
        command: blocked?.cmd || "",
        error: blocked?.error || ""
    })

    return await database.Client.updateOne(
        { id: env.SAPHIRE_ID },
        {
            $push: {
                BlockedCommands: {
                    $each: [
                        {
                            cmd: command,
                            error: reason
                        }
                    ],
                    $position: 0
                }
            }
        }
    )
        .then(() => res.send({
            message: "Block Command: SUCCESS",
            command,
            error: reason
        }))
        .catch(err => res.send({
            message: "Block Command: FAILED",
            command,
            error: err
        }))
}

async function unblockCommand(req: Request, res: Response) {

    const { body } = req;
    const { command, userid } = body || {};

    if (Array.isArray(command)) return unblockMultiCommand(req, res);

    const clientData = await database.getClientData();

    if (!(clientData?.Administradores || []).includes(userid)) return res.send({ message: "Unauthorized" })
    if (!command || !userid) return res.send({ message: "missing data" });

    const blocked = (clientData?.BlockedCommands || []).find(cmd => cmd?.cmd === command);
    if (!blocked) return res.send({ message: "command is not blocked" })

    return await database.Client.updateOne(
        { id: env.SAPHIRE_ID },
        { $pull: { BlockedCommands: { cmd: command } } }
    )
        .then(() => res.send({
            message: "Unblock Command: SUCCESS",
            command,
            error: ""
        }))
        .catch(err => res.send({
            message: "Unblock Command: FAILED",
            command,
            error: err
        }))
}

async function unblockallCommand(req: Request, res: Response) {

    const userid = req?.body?.userid || "";
    const clientData = await database.getClientData();

    if (!(clientData?.Administradores || []).includes(userid)) return res.send({ message: "Unauthorized" })

    if (!(clientData?.BlockedCommands || [])?.length) return res.send({ message: "No command blocked" })

    return await database.Client.updateOne(
        { id: env.SAPHIRE_ID },
        { $set: { BlockedCommands: [] } }
    )
        .then(() => res.send({
            message: "Unblock All Commands: SUCCESS",
            command: "All Blocked Commands",
            error: ""
        }))
        .catch(err => res.send({
            message: "Unblock Command: FAILED",
            command: clientData?.Administradores?.join(", ") || "",
            error: err
        }))
}

async function blockMultiCommand(req: Request, res: Response) {

    const { body } = req;
    const { command, reason, userid }: { command: string[], reason: string, userid: string } = body || {};

    if (!command?.length)
        return res.send({
            message: "No command given",
            command: [],
            error: ""
        })

    const clientData = await database.getClientData();

    if (!(clientData?.Administradores || []).includes(userid)) return res.send({ message: "Unauthorized" })
    if (!command?.length || !reason || !userid) return res.send({ message: "missing data" });

    const blocked = command.filter(cmdQ => (clientData?.BlockedCommands || []).some(cmd => cmd?.cmd === cmdQ));
    const unblocked = command.filter(cmd => !blocked.includes(cmd));

    if (blocked.length === command.length)
        return res.send({
            message: "All command is blocked",
            command: blocked,
            error: ""
        });

    const success: string[] = [];
    const fail: string[] = blocked;

    for await (const cmd of unblocked)
        await database.Client.updateOne(
            { id: env.SAPHIRE_ID },
            {
                $push: {
                    BlockedCommands: {
                        $each: [{ cmd, error: reason }],
                        $position: 0
                    }
                }
            }
        )
            .then(() => success.push(cmd))
            .catch(() => fail.push(cmd))

    return res.send({
        message: "Block multi command: COMPLETE",
        commands: { success, fail },
        error: ""
    })
}

async function unblockMultiCommand(req: Request, res: Response) {

    const { body } = req;
    const { command, userid }: { command: string[], userid: string } = body || {};

    if (!command?.length)
        return res.send({
            message: "No command given",
            command: [],
            error: ""
        })

    const clientData = await database.getClientData();

    if (!(clientData?.Administradores || []).includes(userid)) return res.send({ message: "Unauthorized" })
    if (!command?.length || !userid) return res.send({ message: "missing data" });

    const blocked = command.filter(cmdQ => (clientData?.BlockedCommands || []).some(cmd => cmd?.cmd === cmdQ));
    const unblocked = command.filter(cmd => !blocked.includes(cmd));

    if (unblocked.length === command.length)
        return res.send({
            message: "All command is unblocked",
            command: unblocked,
            error: ""
        });

    const success: string[] = [];
    const fail: string[] = unblocked;

    for await (const cmd of blocked)
        await database.Client.updateOne(
            { id: env.SAPHIRE_ID },
            { $pull: { BlockedCommands: { cmd: command } } }
        )
            .then(() => success.push(cmd))
            .catch(() => fail.push(cmd))

    return res.send({
        message: "Unblock multi command: COMPLETE",
        commands: { success, fail },
        error: ""
    })
}