import axios from "axios"
import { writeFileSync } from "fs"
import { env } from "process"
import { emojis } from "../../json/data.json"
import { message, webhook } from "./execute.backup"
let count = 1
const loadEmojis = { green: "🟩", white: "⬜", gold: "🟧" }

async function save(fileName: string, url: string): Promise<void> {

    const data: [] | false = await axios({
        url, method: "GET",
        headers: { authorization: env.ROUTE_GET_DATA_FROM_DATABASE_PASSWORD }
    })
        .then(response => {
            const data = response.data || []
            if (message) {

                const loadArray = ["⬜", "⬜", "⬜", "⬜", "⬜", "⬜", "⬜", "⬜", "⬜", "⬜", "⬜", "⬜"]

                for (let i = 0; i <= count; i++)
                    loadArray[i] = data.length > 0 ? loadEmojis["green"] : loadEmojis["gold"]

                webhook?.editMessage(message.id, { content: `${emojis.loading} Carregando...\n${loadArray.join("")}` })
                count++
            }
            return data
        })
        .catch(() => false)

    if (Array.isArray(data))
        writeFileSync(`${fileName}.json`, JSON.stringify(data))

    return
}

function redefine() {
    count = 1
}

export { save, redefine }