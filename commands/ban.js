import { SlashCommandBuilder } from "discord.js"

export default {
data: new SlashCommandBuilder()
.setName("ban")
.setDescription("ลบสิทธิ์ Whitelist ของสมาชิก")
.addUserOption(option =>
option.setName("user")
.setDescription("สมาชิกที่จะแบน")
.setRequired(true)
)
.addStringOption(option =>
option.setName("reason")
.setDescription("เหตุผลการแบน")
),

async execute(interaction, config){
const user = interaction.options.getUser("user")
const reason = interaction.options.getString("reason") || "ไม่ระบุ"

try {
const member = await interaction.guild.members.fetch(user.id).catch(() => null)

if(!member) {
return interaction.reply({content: "ไม่พบสมาชิก", ephemeral: true})
}

// ลบ Role
await member.roles.remove(config.whitelistRole).catch(() => {})

// ส่ง DM
await user.send(`❌ สิทธิ์ Whitelist ถูกลบออก\nเหตุผล: ${reason}`).catch(() => {})

return interaction.reply(`ลบสิทธิ์ Whitelist ของ ${user} แล้ว`)
} catch(err) {
return interaction.reply({content: "เกิดข้อผิดพลาด", ephemeral: true})
}
}
}
