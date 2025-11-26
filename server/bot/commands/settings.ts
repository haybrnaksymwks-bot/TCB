import { 
  SlashCommandBuilder, 
  ChatInputCommandInteraction,
  ChannelType,
  PermissionFlagsBits
} from 'discord.js';
import { db } from '../../db';
import { serverSettings } from '@shared/schema';
import { eq } from 'drizzle-orm';

export const settingsCommand = {
  data: new SlashCommandBuilder()
    .setName('إعدادات')
    .setDescription('تخصيص إعدادات البوت')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
      subcommand
        .setName('قناة_الأخبار')
        .setDescription('تحديد قناة الأخبار')
        .addChannelOption(option =>
          option
            .setName('القناة')
            .setDescription('القناة المخصصة للأخبار')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('قناة_التصويت')
        .setDescription('تحديد قناة التصويتات')
        .addChannelOption(option =>
          option
            .setName('القناة')
            .setDescription('القناة المخصصة للتصويتات')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('قناة_logs')
        .setDescription('تحديد قناة السجلات')
        .addChannelOption(option =>
          option
            .setName('القناة')
            .setDescription('القناة المخصصة للسجلات')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('عرض')
        .setDescription('عرض الإعدادات الحالية')
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      const guildId = interaction.guildId!;
      const subcommand = interaction.options.getSubcommand();

      const settingsRows = await db
        .select()
        .from(serverSettings)
        .where(eq(serverSettings.guildId, guildId));

      const settings = settingsRows[0] || null;

      if (subcommand === 'عرض') {
        const embed = {
          title: '⚙️ إعدادات السيرفر',
          color: 0x5865F2,
          fields: [
            { name: 'قناة الأخبار', value: settings?.newsChannelId ? `<#${settings.newsChannelId}>` : 'غير محددة', inline: true },
            { name: 'قناة التصويت', value: settings?.pollChannelId ? `<#${settings.pollChannelId}>` : 'غير محددة', inline: true },
            { name: 'قناة السجلات', value: settings?.logsChannelId ? `<#${settings.logsChannelId}>` : 'غير محددة', inline: true },
            { name: 'السماح بالمنشنات', value: settings?.allowMentions ? 'نعم ✅' : 'لا ❌', inline: true },
            { name: 'عدد الصور', value: settings?.imageCount?.toString() || '2', inline: true },
          ],
          timestamp: new Date().toISOString(),
        };

        await interaction.editReply({ embeds: [embed] });
        return;
      }

      const channel = interaction.options.getChannel('القناة', true);
      const updateData: any = { updatedAt: new Date() };

      if (subcommand === 'قناة_الأخبار') {
        updateData.newsChannelId = channel.id;
      } else if (subcommand === 'قناة_التصويت') {
        updateData.pollChannelId = channel.id;
      } else if (subcommand === 'قناة_logs') {
        updateData.logsChannelId = channel.id;
      }

      if (settings) {
        await db
          .update(serverSettings)
          .set(updateData)
          .where(eq(serverSettings.guildId, guildId));
      } else {
        await db.insert(serverSettings).values({
          guildId,
          ...updateData,
        });
      }

      await interaction.editReply(`✅ تم تحديث الإعدادات بنجاح`);
    } catch (error) {
      console.error('خطأ في أمر الإعدادات:', error);
      throw error;
    }
  },
};
