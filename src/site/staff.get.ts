import { Request, Response } from "express"
import { staffs } from "."
import { staffData } from "../@types"
import getDescription from "./description.get"
import getSocial from "./social.get"

export default async (_: Request, res: Response) => {

    const developers = [] as staffData[]
    const admins = [] as staffData[]
    const boards = [] as staffData[]
    const staff = [] as staffData[]

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
            staffs.set(data.id, data)
        })

    return res.send([developers, admins, boards, staff].flat())
}