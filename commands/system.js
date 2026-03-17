import { SlashCommandBuilder } from "discord.js"

export const systemOn = {
data: new SlashCommandBuilder()
.setName("system-on")
.setDescription("เปิดระบบสมัคร Whitelist"),

async execute(interaction, stateManager){
stateManager.systemEnabled = true
return interaction.reply({content:"✅ เปิดระบบสมัครแล้ว", ephemeral:true})
}
}

export const systemOff = {
data: new SlashCommandBuilder()
.setName("system-off")
.setDescription("ปิดระบบสมัคร Whitelist"),

async execute(interaction, stateManager){
stateManager.systemEnabled = false
return interaction.reply({content:"❌ ปิดระบบสมัครแล้ว", ephemeral:true})
}
}
