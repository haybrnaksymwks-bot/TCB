import { Interaction } from 'discord.js';
import { khabarCommand } from '../commands/khabar';
import { tasweetCommand } from '../commands/tasweet';
import { settingsCommand } from '../commands/settings';
import { qalibCommand } from '../commands/qalib';
import { styleCommand } from '../commands/style';
import { handleKhabarModal } from '../modals/khabar';
import { handleTasweetModal } from '../modals/tasweet';
import { handlePollButton } from '../buttons/poll';

const commands = new Map([
  ['خبر', khabarCommand],
  ['تصويت', tasweetCommand],
  ['إعدادات', settingsCommand],
  ['قالب', qalibCommand],
  ['ستايل', styleCommand],
]);

export async function handleInteraction(interaction: Interaction) {
  try {
    if (interaction.isChatInputCommand()) {
      const command = commands.get(interaction.commandName);
      if (command) {
        await command.execute(interaction);
      }
    } else if (interaction.isModalSubmit()) {
      if (interaction.customId === 'khabar_modal') {
        await handleKhabarModal(interaction);
      } else if (interaction.customId === 'tasweet_modal') {
        await handleTasweetModal(interaction);
      }
    } else if (interaction.isButton()) {
      if (interaction.customId.startsWith('poll_vote_')) {
        await handlePollButton(interaction);
      }
    }
  } catch (error) {
    console.error('خطأ في معالجة التفاعل:', error);
    
    const errorMessage = '❌ حدث خطأ أثناء تنفيذ الأمر';
    
    if (interaction.isRepliable()) {
      if (interaction.replied || interaction.deferred) {
        await interaction.editReply(errorMessage);
      } else {
        await interaction.reply({ content: errorMessage, ephemeral: true });
      }
    }
  }
}
