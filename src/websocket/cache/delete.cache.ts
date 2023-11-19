import { redis } from "../../database"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default async (id: string | undefined, _: "user" | "guild" | undefined) => {
    if (!id) return
    return await redis.del(id);
}