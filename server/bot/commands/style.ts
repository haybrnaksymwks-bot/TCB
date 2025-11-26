import { 
  SlashCommandBuilder, 
  ChatInputCommandInteraction
} from 'discord.js';
import { db } from '../../db';
import { styles } from '@shared/schema';

export const styleCommand = {
  data: new SlashCommandBuilder()
    .setName('ستايل')
    .setDescription('إدارة أنماط الإعلانات')
    .addSubcommand(subcommand =>
      subcommand
        .setName('قائمة')
        .setDescription('عرض جميع الأنماط المتاحة')
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    const allStyles = await db.select().from(styles);

    if (allStyles.length === 0) {
      await interaction.editReply('❌ لا توجد أنماط محفوظة حالياً');
      return;
    }

    const stylesList = allStyles.map(style => 
      `**${style.name}** ${style.isDefault ? '⭐' : ''}`
    ).join('\n');

    const embed = {
      title: '🎨 الأنماط المتاحة',
      description: stylesList,
      color: 0x5865F2,
      footer: { text: `المجموع: ${allStyles.length}` },
    };

    await interaction.editReply({ embeds: [embed] });
  },
};
