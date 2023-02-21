import { execute } from "./execute.backup"

const date = new Date()
date.setDate(date.getDate() + 1)
date.setHours(0, 0, 0, 0)
const midnight = date.valueOf()
const timeRemaing = midnight - Date.now()

setTimeout(() => execute(), timeRemaing)