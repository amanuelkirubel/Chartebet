const { Telegraf, Markup } = require('telegraf');

const BOT_TOKEN = '8612862555:AAEs2aeeB2WSg3WCC5XMEUka2NBuoOpCGHA';
const GAME_URL = 'https://chartebet.onrender.com/';

const bot = new Telegraf(BOT_TOKEN);

// 1. Triggered when user types /start
bot.command('start', (ctx) => {
  return ctx.reply(
    '👋 Welcome! Please share your phone number to register:',
    Markup.keyboard([
      [Markup.button.contactRequest('📱 Share Phone Number')]
    ]).resize().oneTime()
  );
});

// 2. Triggered when user shares their phone number
bot.on('contact', async (ctx) => {
  const phoneNumber = ctx.message.contact.phone_number;

  await ctx.reply(`✅ Thanks! You're now registered with ${phoneNumber}.`);

  await ctx.reply(
    "🎰 It's Game Time! Good Luck!",
    Markup.inlineKeyboard([
      [Markup.button.webApp('8️⃣ Start Playing', GAME_URL)]
    ])
  );

  return ctx.reply(
    '🔻 Discover more in the menu! 🔻',
    Markup.keyboard([
      ['🎮 Play Games'],
      ['🎁 Invite Friends', '🆘 Support']
    ]).resize()
  );
});

bot.launch();
console.log('Bot server is running...');
