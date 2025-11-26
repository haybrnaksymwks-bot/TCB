import { 
  SlashCommandBuilder, 
  ChatInputCommandInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ModalActionRowComponentBuilder
} from 'discord.js';

export const tasweetCommand = {
  data: new SlashCommandBuilder()
    .setName('تصويت')
    .setDescription('إنشاء تصويت تفاعلي'),

  async execute(interaction: ChatInputCommandInteraction) {
    const modal = new ModalBuilder()
      .setCustomId('tasweet_modal')
      .setTitle('✦ إنشاء تصويت جديد ✦');

    const questionInput = new TextInputBuilder()
      .setCustomId('tasweet_question')
      .setLabel('سؤال التصويت')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('ما هو سؤالك؟')
      .setRequired(true)
      .setMaxLength(256);

    const optionsInput = new TextInputBuilder()
      .setCustomId('tasweet_options')
      .setLabel('الخيارات (كل خيار في سطر)')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('الخيار الأول\nالخيار الثاني\nالخيار الثالث')
      .setRequired(true)
      .setMaxLength(1000);

    const durationInput = new TextInputBuilder()
      .setCustomId('tasweet_duration')
      .setLabel('مدة التصويت بالدقائق (اختياري)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('60')
      .setRequired(false);

    const firstRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(questionInput);
    const secondRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(optionsInput);
    const thirdRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(durationInput);

    modal.addComponents(firstRow, secondRow, thirdRow);

    await interaction.showModal(modal);
  },
};
