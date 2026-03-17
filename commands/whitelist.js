import { SlashCommandBuilder, EmbedBuilder } from "discord.js"

export default {
data: new SlashCommandBuilder()
.setName("whitelist")
.setDescription("ตัดสิน whitelist")
.addUserOption(option =>
option.setName("user")
.setDescription("ผู้สมัคร")
.setRequired(true)
)
.addStringOption(option =>
option.setName("status")
.setDescription("ผลการสมัคร")
.setRequired(true)
.addChoices(
{name:"ผ่าน",value:"pass"},
{name:"ไม่ผ่าน",value:"fail"}
))
.addStringOption(option =>
option.setName("roblox")
.setDescription("roblox username")
)
.addStringOption(option =>
option.setName("reason")
.setDescription("เหตุผล")
),

async execute(interaction){

const user = interaction.options.getUser("user")
const status = interaction.options.getString("status")
const roblox = interaction.options.getString("roblox")
const reason = interaction.options.getString("reason")

if(status === "pass"){

const embed = new EmbedBuilder()
.setColor("Green")
.setTitle("ผลการสมัคร whitelist : ผ่าน")
.setDescription(`${user} ได้รับการอนุมัติ whitelist`)
.addFields(
{name:"Council",value:`${interaction.user}`,inline:true},
{name:"Roblox",value:`${roblox || "-"}`,inline:true}
)

await interaction.reply({embeds:[embed]})

await user.send(`✅ คุณผ่าน whitelist แล้ว\nRoblox : ${roblox}`).catch(() => {})

}

if(status === "fail"){

const embed = new EmbedBuilder()
.setColor("Red")
.setTitle("ผลการสมัคร whitelist : ไม่ผ่าน")
.setDescription(`${user} ไม่ผ่าน whitelist`)
.addFields(
{name:"เหตุผล",value:`${reason || "ไม่ระบุ"}`}
)

await interaction.reply({embeds:[embed]})

await user.send(`❌ คุณไม่ผ่าน whitelist\nเหตุผล: ${reason || "ไม่ระบุ"}`).catch(() => {})

}

}
}
