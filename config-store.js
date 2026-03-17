import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs"

const STORE_PATH = "./data/store.json"

const store = loadStore()

function loadStore() {
  if (!existsSync(STORE_PATH)) {
    return {
      logChannel: process.env.LOG_CHANNEL,
      applyChannel: process.env.APPLY_CHANNEL,
      resultChannel: process.env.RESULT_CHANNEL || process.env.LOG_CHANNEL
    }
  }

  try {
    const raw = readFileSync(STORE_PATH, "utf8")
    const parsed = JSON.parse(raw)
    return {
      logChannel: parsed.logChannel || process.env.LOG_CHANNEL,
      applyChannel: parsed.applyChannel || process.env.APPLY_CHANNEL,
      resultChannel: parsed.resultChannel || process.env.RESULT_CHANNEL || parsed.logChannel || process.env.LOG_CHANNEL
    }
  } catch {
    return {
      logChannel: process.env.LOG_CHANNEL,
      applyChannel: process.env.APPLY_CHANNEL,
      resultChannel: process.env.RESULT_CHANNEL || process.env.LOG_CHANNEL
    }
  }
}

function saveStore() {
  mkdirSync("data", { recursive: true })
  writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf8")
}

export function getLogChannelId() {
  return store.logChannel || process.env.LOG_CHANNEL
}

export function setLogChannelId(id) {
  store.logChannel = id
  saveStore()
}

export function getApplyChannelId() {
  return store.applyChannel || process.env.APPLY_CHANNEL
}

export function setApplyChannelId(id) {
  store.applyChannel = id
  saveStore()
}

export function getResultChannelId() {
  return store.resultChannel || store.logChannel || process.env.RESULT_CHANNEL || process.env.LOG_CHANNEL
}

export function setResultChannelId(id) {
  store.resultChannel = id
  saveStore()
}
