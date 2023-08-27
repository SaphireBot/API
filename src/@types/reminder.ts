import { ObjectId } from "mongoose"

export interface ReminderType {
    _id?: ObjectId | undefined
    __v?: any
    id: string
    userId: string
    guildId: string
    RemindMessage: string
    Time: number
    deleteAt?: number | undefined
    snoozed: boolean
    timeout: NodeJS.Timeout | false
    isAutomatic: boolean
    DateNow: number
    ChannelId: string
    Alerted: boolean
    privateOrChannel: boolean
    interval: number
}

export interface RemindersToDelete {
    id: string
}