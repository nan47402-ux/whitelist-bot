import { SlashCommandBuilder } from "discord.js"

export default {
data: new SlashCommandBuilder()
.setName("cooldown-toggle")
.setDescription("เปิด/ปิด Cooldown การสมัคร"),

async execute(interaction, cooldownState){
cooldownState.enabled = !cooldownState.enabled
const status = cooldownState.enabled ? "เปิด" : "ปิด"

return interaction.reply({
content: `Cooldown สมัคร **${status}** แล้ว`,
ephemeral: true
})
}
}
