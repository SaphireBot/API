export default function getDescription(userId: string) {
    return {
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
}