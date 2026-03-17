import { SlashCommandBuilder, ChannelType } from "discord.js"
import { setApplyChannelId } from "../config-store.js"
import config from "../config.js"

export default {
  data: new SlashCommandBuilder()
    .setName("set-apply")
    .setDescription("ตั้งค่าช่องสำหรับปุ่มยื่นยันตัวตน (ฟอร์มสมัคร)")
    .addChannelOption(option =>
      option
        .setName("channel")
        .setDescription("เลือกห้องที่จะให้บอตโพสต์ปุ่มยื่นยันตัวตน")
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
        content: "คุณไม่มีสิทธิ์ตั้งค่าช่องฟอร์ม",
        ephemeral: true
      })
    }

    setApplyChannelId(channel.id)

    return interaction.reply({
      content: `ตั้งค่าช่องฟอร์มเป็น ${channel} แล้ว`,
      ephemeral: true
    })
  }
}
