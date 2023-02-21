import axios from "axios"
import { rmSync, writeFileSync } from "fs"
import { env } from "process"
import Zip from "../../util/zip"
import { emojis } from "../../json/data.json"

export default async (fileName: string, url: string): Promise<boolean> => {

    const data: [] | false = await axios({
        url,
        method: "GET",
        headers: {
            authorization: env.ROUTE_GET_DATA_FROM_DATABASE_PASSWORD
        }
    })
        .then(data => data.data || [])
        .catch(() => false)

    let success = false

    if (Array.isArray(data) && data.length) {
        writeFileSync(`${fileName}.json`, JSON.stringify(data))

        const zip = new Zip(`./src/services/backup/temp/${fileName}.zip`)
        zip.appendFileList([`${fileName}.json`], __dirname)
        success = await zip.finalize().catch(() => false)

        rmSync(`${fileName}.json`)
    }

    let content = success
        ? `${emojis.check} Backup dos arquivos **\`${fileName}\`** efetuado com sucesso.`
        : `${emojis.deny} Falha ao executar o backup dos arquivos **\`${fileName}\`**`

    if (Array.isArray(data) && data.length == 0)
        content = `${emojis.deny} Os arquivos **\`${fileName}\`** estão vazios.`

    await axios({
        url: env.WEBHOOK_STATUS,
        method: "POST",
        data: { content, username: "[API] Database Backup Manager" }
    })
        .catch(() => null)

    return success
}