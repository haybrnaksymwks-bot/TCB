import { ModalSubmitInteraction, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import { db } from '../../db';
import { serverSettings, polls } from '@shared/schema';
import { eq } from 'drizzle-orm';

export async function handleTasweetModal(interaction: ModalSubmitInteraction) {
  await interaction.deferReply({ ephemeral: true });

  const question = interaction.fields.getTextInputValue('tasweet_question');
  const optionsText = interaction.fields.getTextInputValue('tasweet_options');
  const durationText = interaction.fields.getTextInputValue('tasweet_duration') || '';

  const options = optionsText.split('\n').filter(opt => opt.trim().length > 0);

  if (options.length < 2) {
    await interaction.editReply('❌ يجب أن يحتوي التصويت على خيارين على الأقل');
    return;
  }

  if (options.length > 10) {
    await interaction.editReply('❌ الحد الأقصى للخيارات هو 10');
    return;
  }

  const [settings] = await db
    .select()
    .from(serverSettings)
    .where(eq(serverSettings.guildId, interaction.guildId!));

  if (!settings?.pollChannelId) {
    await interaction.editReply('❌ لم يتم تعيين قناة التصويت! استخدم `/إعدادات قناة_التصويت` أولاً');
    return;
  }

  const pollChannel = await interaction.guild!.channels.fetch(settings.pollChannelId);
  if (!pollChannel?.isTextBased()) {
    await interaction.editReply('❌ القناة المحددة غير صالحة');
    return;
  }

  const duration = parseInt(durationText);
  const endsAt = duration && !isNaN(duration) ? new Date(Date.now() + duration * 60 * 1000) : null;

  const pollEmbed = new EmbedBuilder()
    .setTitle('📊 ' + question)
    .setDescription(options.map((opt, i) => `${i + 1}. ${opt}`).join('\n'))
    .setColor(0x5865F2)
    .setFooter({ text: `بواسطة ${interaction.user.username}` })
    .setTimestamp();

  if (endsAt) {
    pollEmbed.addFields({
      name: '⏰ ينتهي في',
      value: `<t:${Math.floor(endsAt.getTime() / 1000)}:R>`,
    });
  }

  const buttons: ButtonBuilder[] = options.slice(0, 5).map((opt, i) =>
    new ButtonBuilder()
      .setCustomId(`poll_vote_${i}`)
      .setLabel(`${i + 1}. ${opt.substring(0, 50)}`)
      .setStyle(ButtonStyle.Primary)
  );

  const rows: ActionRowBuilder<ButtonBuilder>[] = [];
  for (let i = 0; i < buttons.length; i += 5) {
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(buttons.slice(i, i + 5));
    rows.push(row);
  }

  const pollMessage = await pollChannel.send({
    embeds: [pollEmbed],
    components: rows,
  });

  await db.insert(polls).values({
    guildId: interaction.guildId!,
    channelId: pollChannel.id,
    messageId: pollMessage.id,
    question,
    options,
    allowChange: true,
    endsAt,
    createdBy: interaction.user.id,
    isActive: true,
  });

  await interaction.editReply(`✅ تم إنشاء التصويت بنجاح في <#${pollChannel.id}>`);

  if (endsAt) {
    setTimeout(async () => {
      await closePoll(pollMessage.id);
    }, duration! * 60 * 1000);
  }
}

async function closePoll(messageId: string) {
  try {
    const [poll] = await db
      .select()
      .from(polls)
      .where(eq(polls.messageId, messageId));

    if (!poll || !poll.isActive) return;

    await db
      .update(polls)
      .set({ isActive: false })
      .where(eq(polls.messageId, messageId));

    console.log(`✅ تم إغلاق التصويت: ${poll.question}`);
  } catch (error) {
    console.error('خطأ في إغلاق التصويت:', error);
  }
}
