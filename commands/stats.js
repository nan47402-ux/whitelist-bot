import { SlashCommandBuilder, EmbedBuilder } from "discord.js"
import { getApplyChannelId, getLogChannelId, getResultChannelId } from "../config-store.js"

export default {
data: new SlashCommandBuilder()
.setName("stats")
.setDescription("ดูสถิติการสมัคร Whitelist"),

async execute(interaction, statsData){
const applyChannel = getApplyChannelId()
const logChannel = getLogChannelId()
const resultChannel = getResultChannelId()

const embed = new EmbedBuilder()
.setTitle("📊 สถิติการสมัคร Whitelist")
.setColor("Blue")
.addFields(
{name: "📝 รายงานเข้า", value: `${statsData.total || 0}`, inline: true},
{name: "✅ ผ่าน", value: `${statsData.approved || 0}`, inline: true},
{name: "⏳ รอ", value: `${statsData.pending || 0}`, inline: true},
{name: "❌ ไม่ผ่าน", value: `${statsData.denied || 0}`, inline: true},
{name: "📈 อัตราสำเร็จ", value: `${statsData.total === 0 ? "0" : Math.round((statsData.approved / statsData.total) * 100)}%`, inline: true},
{name: "⏱️ อัตราการทำงาน", value: `${(statsData.approved + statsData.denied) === 0 ? "0" : Math.round(((statsData.approved + statsData.denied) / statsData.total) * 100)}%`, inline: true},
{name: "📨 ห้องฟอร์ม", value: applyChannel ? `<#${applyChannel}>` : "ยังไม่ตั้ง", inline: true},
{name: "🪵 ห้อง log หลัก", value: logChannel ? `<#${logChannel}>` : "ยังไม่ตั้ง", inline: true},
{name: "✅/❌ ห้องผลอนุมัติ", value: resultChannel ? `<#${resultChannel}>` : "ยังไม่ตั้ง", inline: true}
)
.setTimestamp()

return interaction.reply({embeds: [embed]})
}
}
