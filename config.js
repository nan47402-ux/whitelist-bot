const required = [
  "TOKEN",
  "GUILD_ID",
  "APPLY_CHANNEL",
  "LOG_CHANNEL",
  "WHITELIST_ROLE"
]

// Stop startup early if any env var is missing
const missing = required.filter(key => !process.env[key])
if (missing.length) {
  throw new Error(`Missing env vars: ${missing.join(", ")}`)
}

export default {
  token: process.env.TOKEN,
  guildId: process.env.GUILD_ID,
  applyChannel: process.env.APPLY_CHANNEL,
  logChannel: process.env.LOG_CHANNEL,
  whitelistRole: process.env.WHITELIST_ROLE,
  adminRole: process.env.ADMIN_ROLE || "",
  applyBanner:
    process.env.APPLY_BANNER ||
    "https://cdn.discordapp.com/attachments/1481926306064240651/1481998062275657840/6627f967dbe852ce.png"
}
