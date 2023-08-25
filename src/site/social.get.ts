export default function getSocial(userId: string) {

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