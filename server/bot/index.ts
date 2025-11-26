import { Client, GatewayIntentBits, Partials, Events } from 'discord.js';
import { registerCommands } from './commands/register';
import { handleInteraction } from './handlers/interactions';
import { db } from '../db';

const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN;

if (!DISCORD_TOKEN) {
  console.error('❌ DISCORD_BOT_TOKEN غير موجود في البيئة');
  process.exit(1);
}

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Channel, Partials.Message],
});

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`✅ ثندر بوت جاهز! تم تسجيل الدخول كـ ${readyClient.user.tag}`);
  
  await registerCommands(readyClient);
  console.log('✅ تم تسجيل جميع الأوامر بنجاح');
});

client.on(Events.InteractionCreate, handleInteraction);

export async function startBot() {
  try {
    await client.login(DISCORD_TOKEN);
  } catch (error) {
    console.error('❌ فشل تسجيل دخول البوت:', error);
    process.exit(1);
  }
}
