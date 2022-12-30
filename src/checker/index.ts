import axios from "axios";
import { SaphireApiBotResponse } from "../@types";
import discloud from "./discloud";
import doubleCheck from "./double.check";
import squarecloud from "./squarecloud";

export default async function initCheckerInterval(host: string): Promise<void> {

    doubleCheck()

    const url = host === "Discloud"
        ? "https://saphire.discloud.app/"
        : "https://bot.squareweb.app/"

    const req: SaphireApiBotResponse | null = await axios.get(url, { timeout: 5000 })
        .then((data): SaphireApiBotResponse => data.data)
        .catch((): null =>  null)

    if (!req || !["Online", "success"].includes(req.status))
        return host === "Discloud"
            ? squarecloud()
            : discloud()

    if (req && ["Online", "success"].includes(req.status)) {
        setTimeout(() => initCheckerInterval(host), 7000)
        return;
    }

    return
}