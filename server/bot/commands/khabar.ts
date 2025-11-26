import { 
  SlashCommandBuilder, 
  ChatInputCommandInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ModalActionRowComponentBuilder
} from 'discord.js';

export const khabarCommand = {
  data: new SlashCommandBuilder()
    .setName('خبر')
    .setDescription('إنشاء وإرسال خبر/إعلان منسّق'),

  async execute(interaction: ChatInputCommandInteraction) {
    const modal = new ModalBuilder()
      .setCustomId('khabar_modal')
      .setTitle('✦ إنشاء خبر جديد ✦');

    const contentInput = new TextInputBuilder()
      .setCustomId('khabar_content')
      .setLabel('نص الخبر')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('اكتب نص الخبر هنا...\nيمكنك استخدام @e للمنشن الجماعي')
      .setRequired(true)
      .setMaxLength(2000);

    const topImageInput = new TextInputBuilder()
      .setCustomId('khabar_top_image')
      .setLabel('رابط الصورة العلوية (اختياري)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('https://...')
      .setRequired(false);

    const bottomImageInput = new TextInputBuilder()
      .setCustomId('khabar_bottom_image')
      .setLabel('رابط الصورة السفلية (اختياري)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('https://...')
      .setRequired(false);

    const formatInput = new TextInputBuilder()
      .setCustomId('khabar_format')
      .setLabel('نوع الرسالة: embed أو text')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('embed أو text (اختياري - الافتراضي: embed)')
      .setRequired(false);

    const firstRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(contentInput);
    const secondRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(topImageInput);
    const thirdRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(bottomImageInput);
    const fourthRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(formatInput);

    modal.addComponents(firstRow, secondRow, thirdRow, fourthRow);

    await interaction.showModal(modal);
  },
};
