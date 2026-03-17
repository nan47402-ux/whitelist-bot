import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js"
import { getApplyChannelId } from "../config-store.js"

export default {
  data: new SlashCommandBuilder()
    .setName("setup-apply")
    .setDescription("แสดงปุ่มยืนยันตัวตนในแชนแนล"),

  async execute(interaction, config) {
    const button = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("apply")
        .setLabel("ยืนยันตัวตน")
        .setStyle(ButtonStyle.Primary)
    )

    const infoEmbed = new EmbedBuilder()
      .setTitle("🛡️ **วิธีการยืนยันตัวตน**")
      .setDescription(
        [
          "ขั้นตอนง่ายๆ",
          "",
          "📋 ขั้นตอน",
          "• คลิกปุ่ม ยืนยันตัวตน",
          "• กรอกแบบฟอร์ม",
          "• รอการตัดสินจาก COUNCIL",
          "",
          "📝 ข้อมูลที่ต้องกรอก",
          "• ชื่อ - นามสกุล",
          "• ชื่อ Roblox",
          "• หน่วยงาน/ประชาชน",
          "• 🪪 หลักฐาน (ลิงก์รูปภาพ)",
          "",
          "⚠️ หมายเหตุสำคัญ",
          "• ชื่อไม่ตรง : ชื่อที่แจ้งไม่ตรงกับข้อมูลภายในประเทศ/เซิร์ฟเวอร์",
          "• ข้อมูลไม่ครบ : ไม่ระบุนามสกุล หรือพิมพ์ไม่ครบถ้วน",
          "• หลักฐานมีปัญหา : รูปภาพหรือลิงก์หลักฐานไม่ถูกต้อง/ไม่ตรงกับที่ส่ง",
          "• ส่งซ้ำซ้อน : ส่งแบบฟอร์มรัวเกินไป (Spam) ในขณะที่ชุดแรกยังไม่ได้รับการตรวจสอบ",
          "• คำตัดสินของ COUNCIL ถือเป็นที่สิ้นสุด"
        ].join("\n")
      )
      .setColor("Blue")
    // ถ้ามีแบนเนอร์ให้แปะใน embed เดียวกันเพื่อลดจำนวน embed ไม่ให้มีสองกล่อง
    if (config.applyBanner) {
      infoEmbed.setImage(config.applyBanner)
    }

    const targetChannelId = getApplyChannelId() || config.applyChannel
    const channel = await interaction.client.channels.fetch(targetChannelId).catch(() => null)

    if (!channel) {
      return interaction.reply({
        content: "ไม่พบห้อง",
        ephemeral: true
      })
    }

    // ลบข้อความเก่าของบอทในช่อง apply (กันไม่ให้มีหลายกล่องซ้ำ)
    try {
      let lastId = null
      for (let i = 0; i < 5; i++) { // ดึงสูงสุด 500 ข้อความล่าสุด
        const batch = await channel.messages.fetch({ limit: 100, before: lastId || undefined })
        const botMsgs = batch.filter(m => m.author.id === interaction.client.user.id)
        await Promise.all(botMsgs.map(m => m.delete().catch(() => null)))
        if (batch.size < 100) break
        lastId = batch.last()?.id
      }
    } catch (err) {
      console.error("Cannot clean old apply messages:", err)
    }

    await channel.send({
      embeds: [infoEmbed],
      components: [button]
    })

    return interaction.reply({
      content: "แสดงปุ่มยืนยันตัวตนแล้ว",
      ephemeral: true
    })
  }
}
