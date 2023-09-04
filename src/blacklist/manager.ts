import { BlacklistData } from "../@types/blacklist";
import { CallbackType } from "../@types";
import { Collection } from "discord.js";
import { ws } from "../server";
import Database from "../database";

export default new class Blacklist {
    Users = new Collection<string, BlacklistData>()
    Guilds = new Collection<string, BlacklistData>()
    Economy = new Collection<string, BlacklistData>()
    Timeouts = new Collection<string, NodeJS.Timeout>()
    Over24Days = new Collection<string, BlacklistData>()

    async load() {

        const documents = await Database.Blacklist.find()
            .then(docs => docs.map(doc => doc.toObject() as BlacklistData))
            .catch(() => [])

        if (!documents?.length) return this.checkOverDays()

        for (const doc of documents.filter(doc => doc.type == "user")) this.Users.set(doc.id, doc)
        for (const doc of documents.filter(doc => doc.type == "guild")) this.Guilds.set(doc.id, doc)
        for (const doc of documents.filter(doc => doc.type == "economy")) this.Economy.set(doc.id, doc)

        for (const data of [this.Users.toJSON(), this.Guilds.toJSON(), this.Economy.toJSON()].flat()) {
            if (!data.removeIn) continue

            const time = data.removeIn.getTime() - data.addedAt.getTime()

            if (time > 2147483647) this.Over24Days.set(data.id, data)
            else this.enableTimeout(data.id, time)
            continue;
        }

        return this.checkOverDays()
    }

    enableTimeout(id: string, time: number) {
        const timeout = setTimeout(() => this.remove(id), time)
        return this.Timeouts.set(id, timeout)
    }

    checkOverDays(): NodeJS.Timeout {

        if (this.Over24Days.size)
            for (const data of this.Over24Days.toJSON()) {
                if (!data.removeIn) this.Over24Days.delete(data.id)
                if (data.removeIn && ((data.removeIn.getTime() - data.addedAt.getTime()) < 2147483647)) {
                    this.enableTimeout(data.id, data.removeIn?.getTime() - data.addedAt.getTime())
                    this.Over24Days.delete(data.id)
                    continue
                }
            }

        return setTimeout(() => this.checkOverDays(), 1000 * 60 * 60)
    }

    async remove(id: string): Promise<boolean> {

        if (!this.get(id)) return false
        this.clear(id)

        ws.send({ type: "blacklistRemove", id })

        return await Database.Blacklist.deleteMany({ id })
            .catch(err => err)

    }

    get(id: string | undefined) {
        if (!id) return
        return this.Users.get(id) || this.Guilds.get(id) || this.Economy.get(id)
    }

    clear(id: string | undefined) {
        if (!id) return

        this.Users.delete(id)
        this.Guilds.delete(id)
        this.Economy.delete(id)
        this.Over24Days.delete(id)

        if (this.Timeouts.has(id)) {
            clearTimeout(this.Timeouts.get(id))
            this.Timeouts.delete(id)
        }

        return
    }

    async refresh(id: string | undefined) {
        if (!id) return

        return await Database.Blacklist.findOne({ id })
            .then(doc => {
                if (!doc) return
                const data = doc.toObject() as BlacklistData
                if (!data?.id) return

                this.clear(data.id)
                if (data.removeIn)
                    (data.removeIn.getTime() - data.addedAt.getTime()) > 2147483647
                        ? this.Over24Days.set(data.id, data)
                        : this.enableTimeout(data.id, (data?.removeIn?.getTime() || 0) - data.addedAt.getTime())

                ws.send({ type: "blacklistSet", data })
                switch (data.type) {
                    case "economy": this.Economy.set(id, data); break;
                    case "user": this.Users.set(id, data); break;
                    case "guild": this.Guilds.set(id, data); break;
                }
                return
            })
            .catch(() => { })
    }

    async all(callback: CallbackType) {

        return callback([
            this.Users.toJSON(),
            this.Economy.toJSON(),
            this.Guilds.toJSON()
        ].flat())

    }
}