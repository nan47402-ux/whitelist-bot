import { SlashCommandBuilder, ChannelType } from "discord.js"
import { setResultChannelId } from "../config-store.js"
import config from "../config.js"

export default {
  data: new SlashCommandBuilder()
    .setName("set-result-log")
    .setDescription("ตั้งค่าช่องสำหรับแจ้งผล ไม่ผ่าน แยกจาก log หลัก")
    .addChannelOption(option =>
      option
        .setName("channel")
        .setDescription("เลือกห้องสำหรับแจ้งผลอนุมัติ/ปฏิเสธ")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel("channel")

    const hasAdminPerm = interaction.memberPermissions?.has("Administrator")
    const hasAdminRole =
      config.adminRole && interaction.member?.roles?.cache?.has(config.adminRole)

    if (!hasAdminPerm && !hasAdminRole) {
      return interaction.reply({
        content: "คุณไม่มีสิทธิ์ตั้งค่าช่องแจ้งผล",
        ephemeral: true
      })
    }

    setResultChannelId(channel.id)

    return interaction.reply({
      content: `ตั้งค่าช่องแจ้งผลเป็น ${channel} แล้ว`,
      ephemeral: true
    })
  }
}
