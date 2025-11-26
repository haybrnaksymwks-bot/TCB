import { 
  SlashCommandBuilder, 
  ChatInputCommandInteraction
} from 'discord.js';

export const qalibCommand = {
  data: new SlashCommandBuilder()
    .setName('قالب')
    .setDescription('إدارة القوالب الشخصية')
    .addSubcommand(subcommand =>
      subcommand
        .setName('قائمة')
        .setDescription('عرض جميع القوالب المحفوظة')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('حذف')
        .setDescription('حذف قالب محفوظ')
        .addStringOption(option =>
          option
            .setName('الاسم')
            .setDescription('اسم القالب')
            .setRequired(true)
        )
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply({ 
      content: '⏳ هذه الميزة قيد التطوير...', 
      ephemeral: true 
    });
  },
};
