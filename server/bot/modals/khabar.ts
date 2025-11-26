import { ModalSubmitInteraction, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import { db } from '../../db';
import { serverSettings, postedMessages } from '@shared/schema';
import { eq } from 'drizzle-orm';

export async function handleKhabarModal(interaction: ModalSubmitInteraction) {
  await interaction.deferReply({ ephemeral: true });

  const content = interaction.fields.getTextInputValue('khabar_content');
  const topImage = interaction.fields.getTextInputValue('khabar_top_image') || undefined;
  const bottomImage = interaction.fields.getTextInputValue('khabar_bottom_image') || undefined;
  const format = interaction.fields.getTextInputValue('khabar_format')?.toLowerCase().trim() || 'embed';

  const previewEmbed = new EmbedBuilder()
    .setTitle('📋 معاينة الخبر')
    .setDescription(content)
    .setColor(0x5865F2)
    .setFooter({ text: `بواسطة ${interaction.user.username}` });

  if (topImage) previewEmbed.setImage(topImage);
  if (bottomImage) previewEmbed.setThumbnail(bottomImage);

  const publishButton = new ButtonBuilder()
    .setCustomId(`publish_khabar_${interaction.user.id}_${Date.now()}`)
    .setLabel('نشر ✅')
    .setStyle(ButtonStyle.Success);

  const cancelButton = new ButtonBuilder()
    .setCustomId('cancel_khabar')
    .setLabel('إلغاء ❌')
    .setStyle(ButtonStyle.Danger);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(publishButton, cancelButton);

  await interaction.editReply({
    content: '**معاينة الخبر:**',
    embeds: [previewEmbed],
    components: [row],
  });

  const collector = interaction.channel!.createMessageComponentCollector({
    filter: (i) => i.user.id === interaction.user.id,
    time: 300000,
  });

  collector.on('collect', async (i) => {
    if (i.customId.startsWith('publish_khabar_')) {
      await i.deferUpdate();

      const settingsRows = await db
        .select()
        .from(serverSettings)
        .where(eq(serverSettings.guildId, interaction.guildId!));
      
      const settings = settingsRows[0];

      if (!settings?.newsChannelId) {
        await i.editReply({
          content: '❌ لم يتم تعيين قناة الأخبار! استخدم `/إعدادات قناة_الأخبار` أولاً',
          embeds: [],
          components: [],
        });
        return;
      }

      const newsChannel = await interaction.guild!.channels.fetch(settings.newsChannelId);
      if (!newsChannel?.isTextBased()) {
        await i.editReply({
          content: '❌ القناة المحددة غير صالحة',
          embeds: [],
          components: [],
        });
        return;
      }

      const finalContent = content
        .replace(/@e/gi, '@everyone')
        .replace(/@h/gi, '@here');

      const messages = [];

      // الرسالة الأولى: الصورة العلوية
      if (topImage) {
        const msg1 = await newsChannel.send(topImage);
        messages.push(msg1);
      }

      // الرسالة الثانية: الخبر نفسه (embed أو text)
      let msg2;
      if (format === 'text') {
        msg2 = await newsChannel.send({
          content: `**${interaction.user.username}**\n${finalContent}`
        });
      } else {
        const finalEmbed = new EmbedBuilder()
          .setDescription(finalContent)
          .setColor(0x5865F2)
          .setFooter({ text: `— ✦ بقلم: ${interaction.user.username} ✦ —` })
          .setTimestamp();

        msg2 = await newsChannel.send({ embeds: [finalEmbed] });
      }
      messages.push(msg2);

      // الرسالة الثالثة: الصورة السفلية
      if (bottomImage) {
        const msg3 = await newsChannel.send(bottomImage);
        messages.push(msg3);
      }

      await db.insert(postedMessages).values({
        guildId: interaction.guildId!,
        channelId: newsChannel.id,
        messageId: msg2.id,
        authorId: interaction.user.id,
        previewText: content,
        finalText: finalContent,
      });

      await i.editReply({
        content: `✅ تم نشر الخبر بنجاح في <#${newsChannel.id}> (${messages.length} رسائل)`,
        embeds: [],
        components: [],
      });

      collector.stop();
    } else if (i.customId === 'cancel_khabar') {
      await i.update({
        content: '❌ تم إلغاء الخبر',
        embeds: [],
        components: [],
      });
      collector.stop();
    }
  });
}
