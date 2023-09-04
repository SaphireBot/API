export interface BlacklistData {
    _id?: string
    __v?: string
    id: string
    type: "user" | "guild" | "economy"
    removeIn?: Date
    addedAt: Date
    staff: string
    reason: string
}