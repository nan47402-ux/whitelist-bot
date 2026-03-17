import { SlashCommandBuilder } from "discord.js"

export default {
data: new SlashCommandBuilder()
.setName("reason")
.setDescription("ส่งเหตุผลการไม่ผ่าน Whitelist")
.addUserOption(option =>
option.setName("user")
.setDescription("สมาชิกที่ไม่ผ่าน")
.setRequired(true)
)
.addStringOption(option =>
option.setName("reason")
.setDescription("เหตุผลการไม่ผ่าน")
.setRequired(true)
),

async execute(interaction){
const user = interaction.options.getUser("user")
const reason = interaction.options.getString("reason")

try {
await user.send(`❌ คุณไม่ผ่าน Whitelist\nเหตุผล: ${reason}`).catch(() => {})
return interaction.reply(`ส่งเหตุผลไปให้ ${user} แล้ว`)
} catch(err) {
return interaction.reply({content: "ไม่สามารถส่งข้อความได้", ephemeral: true})
}
}
}
