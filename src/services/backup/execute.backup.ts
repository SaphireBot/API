import axios from "axios"
import { env } from "process"
import databaseBackup from "./database.backup"
// import usersBackup from "./functions/users.backup"

export default async (): Promise<void> => {

    await axios({
        url: env.WEBHOOK_STATUS,
        method: "POST",
        data: {
            content: "Inicializando o backup do banco de dados...",
            username: "[API] Database Backup Manager"
        }
    })
        .catch(() => null)

    return await databaseBackup()
    // return await usersBackup()
}