import "dotenv/config"
import {
  Client,
  GatewayIntentBits,
  Events,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  REST,
  Routes,
  StringSelectMenuBuilder
} from "discord.js"

import config from "./config.js"
import whitelistCommand from "./commands/whitelist.js"
import applyCommand from "./commands/apply.js"
import { systemOn, systemOff } from "./commands/system.js"
import reasonCommand from "./commands/reason.js"
import banCommand from "./commands/ban.js"
import statsCommand from "./commands/stats.js"
import cooldownToggleCommand from "./commands/cooldown-toggle.js"
import setLogCommand from "./commands/set-log.js"
import setApplyCommand from "./commands/set-apply.js"
import setResultLogCommand from "./commands/set-result-log.js"
import { getLogChannelId, getApplyChannelId, getResultChannelId } from "./config-store.js"

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds
  ]
})

let systemEnabled = false
const stateManager = { systemEnabled: false }
const cooldownState = { enabled: true }
const cooldownUsers = new Set()
const statsData = { total: 0, approved: 0, denied: 0, pending: 0 }

client.once(Events.ClientReady, async () => {
  console.log("Bot Ready")

  try {
    const commands = [
      systemOn.data,
      systemOff.data,
      whitelistCommand.data,
      applyCommand.data,
      reasonCommand.data,
      banCommand.data,
      statsCommand.data,
      cooldownToggleCommand.data,
      setLogCommand.data,
      setApplyCommand.data,
      setResultLogCommand.data
    ]
    const rest = new REST({ version: "10" }).setToken(config.token)

    console.log("Registering Commands...")
    await rest.put(Routes.applicationGuildCommands(client.user.id, config.guildId), {
      body: commands.map(cmd => cmd.toJSON())
    })
    console.log("Commands registered")
  } catch (error) {
    console.error("Error:", error)
  }
})

client.on(Events.InteractionCreate, async interaction => {
  try {
    /* COMMANDS */
    if (interaction.isChatInputCommand()) {
      if (interaction.commandName === "system-on") {
        await systemOn.execute(interaction, stateManager)
        return
      }

      if (interaction.commandName === "system-off") {
        await systemOff.execute(interaction, stateManager)
        return
      }

      if (interaction.commandName === "whitelist") {
        await whitelistCommand.execute(interaction)
      }

      if (interaction.commandName === "setup-apply") {
        await applyCommand.execute(interaction, config)
      }

      if (interaction.commandName === "reason") {
        await reasonCommand.execute(interaction)
      }

      if (interaction.commandName === "ban") {
        await banCommand.execute(interaction, config)
      }

      if (interaction.commandName === "stats") {
        await statsCommand.execute(interaction, statsData)
      }

      if (interaction.commandName === "cooldown-toggle") {
        await cooldownToggleCommand.execute(interaction, cooldownState)
      }

      if (interaction.commandName === "set-log") {
        await setLogCommand.execute(interaction)
      }

      if (interaction.commandName === "set-apply") {
        await setApplyCommand.execute(interaction)
      }

      if (interaction.commandName === "set-result-log") {
        await setResultLogCommand.execute(interaction)
      }
    }

    /* APPLY BUTTON */
    if (interaction.isButton() && interaction.customId === "apply") {
      if (cooldownState.enabled && cooldownUsers.has(interaction.user.id)) {
        return interaction.reply({
          content: "คุณเคยสมัครแล้ว รอการตัดสินจาก COUNCIL",
          ephemeral: true
        })
      }

      const modal = new ModalBuilder()
        .setCustomId("apply_modal")
        .setTitle("ใบอนุญาติเข้าดิส")

      const ic = new TextInputBuilder()
        .setCustomId("ic")
        .setLabel("ชื่อ - นามสกุล (IC)")
        .setStyle(TextInputStyle.Short)

      const roblox = new TextInputBuilder()
        .setCustomId("roblox")
        .setLabel("ชื่อ Roblox")
        .setStyle(TextInputStyle.Short)

      const type = new TextInputBuilder()
        .setCustomId("type")
        .setLabel("สถานะ (หน่วยงาน / ประชาชน)")
        .setStyle(TextInputStyle.Short)

      const proof = new TextInputBuilder()
        .setCustomId("proof")
        .setLabel("หลักฐาน (สามารถแนบไฟล์ภาพได้)")
        .setStyle(TextInputStyle.Paragraph)

      modal.addComponents(
        new ActionRowBuilder().addComponents(ic),
        new ActionRowBuilder().addComponents(roblox),
        new ActionRowBuilder().addComponents(type),
        new ActionRowBuilder().addComponents(proof)
      )

      return interaction.showModal(modal)
    }

    /* MODAL SUBMIT */
    if (interaction.isModalSubmit() && interaction.customId === "apply_modal") {
      const ic = interaction.fields.getTextInputValue("ic")
      const roblox = interaction.fields.getTextInputValue("roblox")
      const type = interaction.fields.getTextInputValue("type")
      const proof = interaction.fields.getTextInputValue("proof")

      // นับสถิติ
      statsData.total++
      statsData.pending++
      cooldownUsers.add(interaction.user.id)

      const embed = new EmbedBuilder()
        .setTitle("📋 ใบอนุญาติเข้าดิส")
        .setColor("Blue")
        .addFields(
          { name: "ชื่อ IC", value: ic },
          { name: "Roblox", value: roblox },
          { name: "สถานะ", value: type },
          { name: "หลักฐาน", value: proof || "ไม่มี" }
        )

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          // encodeเป็น: approve|userId|icName|robloxName
          .setCustomId("approve|" + interaction.user.id + "|" + ic + "|" + roblox)
          .setLabel("ผ่าน")
          .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
          .setCustomId("deny|" + interaction.user.id)
          .setLabel("ไม่ผ่าน")
          .setStyle(ButtonStyle.Danger)
      )

      const logChannelId = getLogChannelId()
      const channel = await client.channels.fetch(logChannelId).catch(() => null)

      if (!channel) {
        return interaction.reply({
          content: "ไม่พบห้อง",
          ephemeral: true
        })
      }

      await channel.send({
        embeds: [embed],
        components: [row]
      })

      return interaction.reply({
        content: "ส่งใบยืนยันตัวตนแล้ว",
        ephemeral: true
      })
    }

    /* APPROVE / DENY */
    if (interaction.isButton()) {
      if (!interaction.customId.includes("|")) return

      const data = interaction.customId.split("|")
      const action = data[0]

      if (action === "approve") {
        const userId = data[1]
        const icName = data[2]
        const robloxName = data[3]

        const member = await interaction.guild.members.fetch(userId).catch(() => null)

        if (!member) {
          return interaction.reply({
            content: "ไม่พบผู้ใช้",
            ephemeral: true
          })
        }

        try {
          await member.roles.add(config.whitelistRole)
        } catch (err) {
          console.error("Could not add role:", err)
        }

        try {
          await member.setNickname(icName)
        } catch (err) {
          console.error("Could not set nickname:", err)
        }

        await member.send("คุณผ่าน Whitelist แล้ว").catch(() => console.log("ไม่สามารถส่ง DM"))

        await interaction.message.edit({ components: [] })

        // นับสถิติ
        statsData.pending--
        statsData.approved++
        cooldownUsers.delete(userId)

        // ส่ง Embed
        const approveEmbed = new EmbedBuilder()
          .setTitle("✅ ผลการสมัคร whitelist: ผ่าน")
          .setDescription(`ผู้สมัคร: <@${userId}>\nอนุมัติโดย: <@${interaction.user.id}>`)
          .setColor("Green")
          .addFields(
            { name: "ชื่อ IC", value: icName, inline: false },
            { name: "Roblox username", value: robloxName, inline: false }
          )
          .setTimestamp()

        return interaction.reply({
          content: `<@${userId}> ได้รับการอนุมัติจาก <@${interaction.user.id}>`,
          embeds: [approveEmbed]
        })

        // Log to log channel
        const logChannelId = getResultChannelId()
        const logChannel = await interaction.client.channels.fetch(logChannelId).catch(() => null)
        if (logChannel) {
          const logEmbed = new EmbedBuilder()
            .setTitle("✅ ผลการสมัคร whitelist: ผ่าน")
            .setColor("Green")
            .addFields(
              { name: "ผู้สมัคร", value: `<@${userId}>`, inline: true },
              { name: "อนุมัติโดย", value: `<@${interaction.user.id}>`, inline: true },
              { name: "ชื่อ IC", value: icName, inline: false },
              { name: "Roblox username", value: robloxName, inline: false }
            )
            .setTimestamp()
          await logChannel.send({ embeds: [logEmbed] }).catch(() => null)
        }
      }

      if (action === "deny") {
        const userId = data[1]
        
        const selectMenu = new StringSelectMenuBuilder()
          .setCustomId("select_deny_reason|" + userId)
          .setPlaceholder("เลือกสาเหตุที่ไม่ผ่าน")
          .addOptions(
            {
              label: "ชื่อไม่ตรง",
              value: "name_mismatch",
              description: "ชื่อที่แจ้งไม่ตรงกับข้อมูลภายในประเทศ"
            },
            {
              label: "ข้อมูลไม่ครบ",
              value: "incomplete_data",
              description: "ไม่ระบุนามสกุล หรือพิมพ์ไม่ครบถ้วน"
            },
            {
              label: "หลักฐานมีปัญหา",
              value: "evidence_issue",
              description: "รูปภาพหรือลิงก์หลักฐานไม่ถูกต้อง"
            },
            {
              label: "ส่งซ้ำซ้อน",
              value: "spam_submission",
              description: "ส่งแบบฟอร์มรัวเกินไป (Spam)"
            }
          )

        const row = new ActionRowBuilder().addComponents(selectMenu)
        return interaction.reply({ components: [row], ephemeral: true })
      }
    }

    /* SELECT MENU - DENY REASON */
      if (interaction.isStringSelectMenu() && interaction.customId.includes("select_deny_reason")) {
        const data = interaction.customId.split("|")
        const userId = data[1]
        const selectedReason = interaction.values[0]

      const reasonMap = {
        "name_mismatch": "ชื่อไม่ตรง - ชื่อที่แจ้งไม่ตรงกับข้อมูลภายในประเทศ",
        "incomplete_data": "ข้อมูลไม่ครบ - ไม่ระบุนามสกุล หรือพิมพ์ไม่ครบถ้วน",
        "evidence_issue": "หลักฐานมีปัญหา - รูปภาพหรือลิงก์หลักฐานไม่ถูกต้อง",
        "spam_submission": "ส่งซ้ำซ้อน - ส่งแบบฟอร์มรัวเกินไป (Spam) ในขณะที่ชุดแรกยังไม่ได้รับการตรวจสอบ"
      }

      const reasonText = reasonMap[selectedReason]

      // อัปเดตสถิติ
      statsData.pending--
      statsData.denied++
      cooldownUsers.delete(userId)

      // ส่ง Embed
      const denyEmbed = new EmbedBuilder()
        .setTitle("❌ ผลการสมัครชื่อ whitelist: ไม่ผ่าน")
        .setColor("Red")
        .addFields(
          { name: "ผู้สมัคร", value: `<@${userId}>`, inline: false },
          { name: "ตัดสินโดย", value: `<@${interaction.user.id}>`, inline: false },
          { name: "สาเหตุ", value: reasonText, inline: false }
        )
        .setTimestamp()

      // ส่ง DM ให้ผู้สมัคร
      const user = await client.users.fetch(userId).catch(() => null)
      if (user) {
        await user.send(`❌ การสมัครของคุณไม่ผ่าน\n\n**สาเหตุ:** ${reasonText}`).catch(() => console.log("ไม่สามารถส่ง DM"))
      }

      // ลบปุ่มจากข้อความเดิม
      await interaction.message.edit({ components: [] }).catch(() => null)

      await interaction.reply({ embeds: [denyEmbed] })

      // Log to log channel
      const logChannelId = getResultChannelId()
      const logChannel = await interaction.client.channels.fetch(logChannelId).catch(() => null)
      if (logChannel) {
        const logEmbed = new EmbedBuilder()
          .setTitle("❌ ผลการสมัคร whitelist: ไม่ผ่าน")
          .setColor("Red")
          .addFields(
            { name: "ผู้สมัคร", value: `<@${userId}>`, inline: true },
            { name: "ตัดสินโดย", value: `<@${interaction.user.id}>`, inline: true },
            { name: "สาเหตุ", value: reasonText, inline: false }
          )
          .setTimestamp()
        await logChannel.send({ embeds: [logEmbed] }).catch(() => null)
      }

      return
    }

  } catch (err) {
    console.error("BOT ERROR:", err)
  }
})

client.login(config.token)
