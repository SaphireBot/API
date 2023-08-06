import { Collection } from "discord.js";
import { SiteStaffs } from "../@types";
import { server } from "../server";
export const staffs = new Collection<string, SiteStaffs>();

server.get("/staffs", async (_, res) => {

    const developers = [] as SiteStaffs[]
    const admins = [] as SiteStaffs[]
    const boards = [] as SiteStaffs[]
    const staff = [] as SiteStaffs[]


    staffs
        .forEach(data => {

            if (!data.avatarUrl) data.avatarUrl = "https://media.discordapp.net/attachments/893361065084198954/1132515877124841522/No-photo-m.png"

            if (data.id) {
                data.social = getSocial(data.id)
                data.description = getDescription(data.id)
            }

            if (data.tags.includes("developer")) return developers.push(data)
            if (data.tags.includes("adminstrator")) return admins.push(data)
            if (data.tags.includes("board of directors")) return boards.push(data)
            if (data.tags.includes("staff")) return staff.push(data)
        })

    return res.send([developers, admins, boards, staff].flat())
})

function getSocial(userId: string) {

    const data = {
        "451619591320371213": { // Rody
            github: "https://github.com/rodycouto",
            instagram: "https://www.instagram.com/rodycouto",
            discord: "https://discord.com/users/451619591320371213"
        },
        "435601052755296256": { // Lucas
            github: "https://github.com/lucasz_u",
            instagram: "https://www.instagram.com/uLucassSz",
            discord: "https://discord.com/users/435601052755296256"
        },
        "648389538703736833": { // André
            github: "https://github.com/andre23k",
            instagram: "https://www.instagram.com/andre_fpss",
            discord: "https://discord.com/users/648389538703736833"
        },
        "920496244281970759": { // Geovanne (Space)
            github: "https://github.com/SpaceGeovanne",
            instagram: "https://www.instagram.com/SpaceGeovanne",
            discord: "https://discord.com/users/920496244281970759"
        },
        "395669252121821227": { // Gorniaky
            github: "https://github.com/Gorniaky",
            instagram: null,
            discord: "https://discord.com/users/395669252121821227"
        },
        "351903530161799178": { // MakolPedro
            github: "https://github.com/MakolPedro",
            instagram: "https://www.instagram.com/makolpedro",
            discord: "https://discord.com/users/351903530161799178"
        }
    }[userId] || {
        github: null,
        instagram: null,
        discord: `https://discord.com/users/${userId}`
    }

    return data
}

function getDescription(userId: string) {

    const data = {
        // Rody
        "451619591320371213": "Criador e fundador da Saphire Moon",

        // Lucas
        "435601052755296256": "Artista principal do Front-End",

        // André
        "648389538703736833": "Diretor geral do Front-End ao Back-End",

        // Geovanne (Space)
        "920496244281970759": "Desenvolvedor Back-End Good-Vibes",

        // Gorniaky
        "395669252121821227": "Desenvolvedor e suporte a Typescript & Conexões",

        // MakolPedro
        "351903530161799178": "Investidor de mais de 2 anos de servidor."
    }[userId] || null

    return data
}