import { SlashCommandBuilder, ChannelType } from "discord.js"
import { setLogChannelId } from "../config-store.js"
import config from "../config.js"

export default {
  data: new SlashCommandBuilder()
    .setName("set-log")
    .setDescription("ตั้งค่าช่อง log สำหรับส่งแจ้งเตือน ผ่าน")
    .addChannelOption(option =>
      option
        .setName("channel")
        .setDescription("เลือกห้องที่ต้องการให้บอตส่ง log")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel("channel")

    // อนุญาตเฉพาะแอดมิน หรือผู้มี role ที่กำหนด
    const hasAdminPerm = interaction.memberPermissions?.has("Administrator")
    const hasAdminRole =
      config.adminRole && interaction.member?.roles?.cache?.has(config.adminRole)

    if (!hasAdminPerm && !hasAdminRole) {
      return interaction.reply({
        content: "คุณไม่มีสิทธิ์ตั้งค่าช่อง log",
        ephemeral: true
      })
    }

    setLogChannelId(channel.id)

    return interaction.reply({
      content: `ตั้งค่าช่อง log เป็น ${channel} แล้ว`,
      ephemeral: true
    })
  }
}
