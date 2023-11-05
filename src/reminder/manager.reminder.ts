import { ReminderType, RemindersToDelete } from "../@types/reminder";
import { CallbackType } from "../@types";
import { Collection } from "discord.js";
import { timeMs } from "./time.reminder";
import Database from "../database";
import execute from "./execute.remider";

export default new class ReminderManager {
    allReminders = new Collection<string, ReminderType>()
    reminders = new Collection<string, ReminderType>()
    over32Bits = new Collection<string, ReminderType>()
    toDelete = <RemindersToDelete[]>[]
    checking = false

    constructor() {
        this.allReminders = new Collection()
        this.reminders = new Collection()
        this.over32Bits = new Collection()
        this.toDelete = []
        this.checking = false
    }

    async load() {

        const AllRemindersData = await Database.Reminder.find()
            .then(MongoDocuments => MongoDocuments.map(doc => doc.toObject()))
            .catch(() => []) as ReminderType[]

        console.log(`${AllRemindersData?.length} Reminders Loaded`);
        if (!AllRemindersData || !AllRemindersData.length) return

        for (const data of AllRemindersData) {
            delete data._id
            delete data.__v

            this.allReminders.set(data.id, data)

            if (data.Alerted || !data.guildId || !data.RemindMessage || !data.userId) {
                this.toDelete.push({ id: data.id })
                continue
            }

            const timeRemain = (data.DateNow + data.Time) - Date.now()

            if (timeRemain > 2147483647) {
                this.over32Bits.set(data.id, { ...data, snoozed: false, timeout: false })
                continue
            }

            const timeout = setTimeout(() => execute(data), timeRemain <= 0 ? 0 : timeRemain)

            this.reminders.set(data.id, { ...data, snoozed: false, timeout: timeout })
        }

        // this.refreshAllReminders(true);
        this.checkBits();
        return this.drop();
    }

    // async refreshAllReminders(starting = false) {

    //     if (!starting) {
    //         const AllRemindersData = await Database.Reminder.find()
    //             .then(MongoDocuments => MongoDocuments.map(doc => doc.toObject()))
    //             .catch(() => []) as ReminderType[]

    //         for (const doc of AllRemindersData)
    //             this.allReminders.set(doc?.id, doc)
    //     }

    //     setTimeout(() => this.refreshAllReminders(), 1000 * 60 * 5)
    // }

    checkBits(): NodeJS.Timeout | void {
        this.checking = true

        if (!this.over32Bits.size) {
            this.checking = false
            return
        }

        for (const reminder of this.over32Bits.toJSON()) {
            const remainTime = (reminder.DateNow + reminder.Time) - Date.now()
            if (remainTime < 2147483647) {
                this.reminders.set(reminder.id, reminder)
                this.allReminders.set(reminder.id, reminder)
                this.over32Bits.delete(reminder.id)
                this.start(reminder)
                continue
            }
            continue
        }

        return setTimeout(() => this.checkBits(), 1000 * 60 * 60)
    }

    async drop() {
        await Database.Reminder.deleteMany({ id: { $in: this.toDelete.map(r => r.id) } })
        for await (const { id } of this.toDelete) {
            await this.removeTimeout(id)
            this.allReminders.delete(id)
            this.reminders.delete(id)
            this.over32Bits.delete(id)
        }
        return
    }

    async removeTimeout(reminderId: string | undefined) {

        if (!reminderId) return

        const reminders = [
            this.allReminders.get(reminderId),
            this.reminders.get(reminderId),
            this.over32Bits.get(reminderId)
        ]

        for (const rm of reminders)
            if (rm?.timeout) clearTimeout(rm.timeout)

        return
    }

    async start(data: ReminderType | undefined) {

        if (!data?.id) return

        const reminder = this.get(data.id, undefined)
        if (reminder?.timeout) {
            await this.removeTimeout(reminder?.id)
            reminder.timeout = false
        }

        const remainTime = (data.DateNow + data.Time) - Date.now()

        if (remainTime > 2147483647) {
            this.reminders.delete(data.id)
            this.allReminders.set(data.id, data)
            this.over32Bits.set(data.id, data)
            if (!this.checking) this.checkBits()
            return
        }

        const timeout = setTimeout(() => execute(data), remainTime)

        if (!reminder) {
            this.reminders.set(data.id, { ...data, timeout })
            this.allReminders.set(data.id, { ...data, timeout })
            return
        }

        reminder.timeout = timeout
        this.allReminders.set(reminder?.id, reminder)
        this.reminders.set(reminder?.id, reminder)
        return reminder
    }

    async remove(reminderId: string | undefined, fromDeleteMany?: boolean) {
        if (!reminderId) return

        if (!fromDeleteMany)
            await Database.Reminder.deleteOne({ id: reminderId })

        await this.removeTimeout(reminderId)
        this.allReminders.delete(reminderId)
        this.reminders.delete(reminderId)
        this.over32Bits.delete(reminderId)
        return
    }

    async removeMany(remindersId: string[]) {

        if (!remindersId?.length) return

        await Database.Reminder.deleteMany({ id: remindersId })

        for (const id of remindersId)
            this.remove(id, true)
        return
    }

    async removeAllRemindersFromAnUser(userId: string | undefined) {
        if (!userId) return
        await Database.Reminder.deleteMany({ userId })
        this.allReminders.sweep(reminder => reminder?.userId == userId)
        this.reminders.sweep(reminder => reminder?.userId == userId)
        this.over32Bits.sweep(reminder => reminder?.userId == userId)
        return
    }

    async save(data: ReminderType, callback: CallbackType | undefined) {
        if (!data) return callback ? callback(false) : ""

        new Database
            .Reminder(data)
            .save()
            .then(() => {
                this.start(data)
                if (callback) return callback(true)
                return
            })
            .catch(err => {
                if (callback) return callback(`Error: ${err}`)
            })
        return
    }

    async revalide(reminderId: string, definedTime: number) {

        return await Database.Reminder.findOneAndUpdate(
            { id: reminderId },
            {
                $set: {
                    Time: definedTime, DateNow: Date.now(), Alerted: false
                }
            },
            { new: true }
        )
            .then(doc => {
                if (!doc) return
                return this.start(doc.toObject())
            })
            .catch(() => { })
    }

    async setAlert(reminderId: string, deleteAt: number, messageId: string) {
        if (!this.reminders.has(reminderId) || !deleteAt || !messageId) return
        const doc = await Database.Reminder.findOneAndUpdate({ id: reminderId }, { Alerted: true, deleteAt, messageId }, { new: true })
        this.allReminders.set(doc?.id, doc?.toObject() as ReminderType)
        this.reminders.set(doc?.id, doc?.toObject() as ReminderType)
    }

    get(reminderId: string, callback: CallbackType | undefined): void | ReminderType {
        const data = this.reminders.get(reminderId) || this.allReminders.get(reminderId) || this.over32Bits.get(reminderId)
        if (!data) {
            if (callback) callback(undefined)
            return
        }
        data.timeout = false
        delete data._id
        return callback ? callback(data) : data
    }

    async move(reminderId: string | undefined, guildId: string | undefined, channelId: string | undefined, callback: CallbackType) {

        if (!reminderId || !guildId || !channelId) return callback("Missing Content")

        const data = this.get(reminderId, undefined)

        if (!data)
            return callback("Not Found")

        if (data.ChannelId === channelId)
            return callback("Same Channel")

        await this.clear(reminderId)
        return await Database.Reminder.findOneAndUpdate(
            { id: reminderId },
            { $set: { guildId, ChannelId: channelId } },
            { new: true }
        )
            .then(async doc => {
                if (!doc) return callback("Error to save reminder")
                this.start(doc.toObject())
                return callback("Success")
            })
            .catch(err => callback(`error: ${err}`))
    }

    async clear(reminderId: string) {
        if (!reminderId) return
        await this.removeTimeout(reminderId)
        this.allReminders.delete(reminderId)
        this.reminders.delete(reminderId)
        this.over32Bits.delete(reminderId)
        return
    }

    async edit(reminderId: string, RemindMessage: string, date: string, callback: CallbackType) {

        if (!reminderId || !RemindMessage || !date)
            return callback("Missing Content")

        const data = this.get(reminderId, undefined)
        if (!data) return callback("Reminder not found")

        const time = timeMs(date)
        if (!time) return callback("Invalid Date")

        if (data.Time == time && RemindMessage == data.RemindMessage)
            return callback("Same data")

        if (time <= 3000)
            return callback("Minimal time is 3 seconds.")

        return await Database.Reminder.findOneAndUpdate(
            { id: reminderId },
            { $set: { Time: time, RemindMessage, DateNow: Date.now() } },
            { new: true }
        )
            .then(doc => {
                if (!doc) return callback("Error to save reminder")
                this.start(doc.toObject())
                return callback("success")
            })
            .catch(err => callback(`Error: ${err}`))
    }

    async snooze(reminderId: string, callback: CallbackType) {

        if (!reminderId) return callback("Missing content")

        const data = this.get(reminderId, undefined)
        if (!data) return callback("Reminder not found")

        return await Database.Reminder.findOneAndUpdate(
            { id: data.id },
            {
                $set: {
                    Time: 1000 * 60 * 10,
                    DateNow: Date.now(),
                    snoozed: true,
                    Alerted: false
                }
            },
            { new: true }
        )
            .then(doc => {
                if (!doc) return callback("Error to save reminder")
                this.start(doc.toObject())
                return callback("Success")
            })
            .catch(err => callback(`error: ${err}`))

    }

    async refresh(reminder: ReminderType, callback: CallbackType) {

        if (!reminder?.id)
            return callback("Not Found")

        await this.removeTimeout(reminder.id)
        this.allReminders.delete(reminder.id)
        this.reminders.delete(reminder.id)
        this.over32Bits.delete(reminder.id)

        this.start(reminder)
        return callback("Success")
    }

}