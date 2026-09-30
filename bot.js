import { Telegraf, Markup } from 'telegraf';
import http from 'http';

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

// 3. Command Handlers
bot.command('website', (ctx) => {
  return ctx.reply(
    '🌐 Visit CharteBet online:',
    Markup.inlineKeyboard([
      [Markup.button.url('🌐 Open Website', GAME_URL)]
    ])
  );
});

bot.command('games', (ctx) => {
  return ctx.reply(
    '🎮 Play Aviator, Chicken Road, Keno, and more!',
    Markup.inlineKeyboard([
      [Markup.button.webApp('🚀 Play Games', GAME_URL)]
    ])
  );
});

bot.command('sports', (ctx) => {
  return ctx.reply(
    '⚽ Live sports betting and match odds:',
    Markup.inlineKeyboard([
      [Markup.button.url('⚽ Sports Betting', GAME_URL)]
    ])
  );
});

bot.command('wallet', (ctx) => {
  return ctx.reply(
    '💳 Wallet & Balance Management:',
    Markup.inlineKeyboard([
      [Markup.button.webApp('💰 Open Wallet', GAME_URL)]
    ])
  );
});

bot.command('help', (ctx) => {
  return ctx.reply('🆘 Customer support & game rules:\n\nContact support or launch the web app to view rules.');
});

// 4. Menu Button Handlers
bot.hears('🎮 Play Games', (ctx) => {
  return ctx.reply(
    '🎰 Ready to play?',
    Markup.inlineKeyboard([
      [Markup.button.webApp('8️⃣ Open Game App', GAME_URL)]
    ])
  );
});

bot.hears('🎁 Invite Friends', (ctx) => {
  return ctx.reply('🎁 Share your referral link with friends to earn bonus rewards!');
});

bot.hears('🆘 Support', (ctx) => {
  return ctx.reply('🆘 Need help? Contact our support team.');
});

// Start Telegram Bot
bot.launch();
console.log('Bot polling service initiated.');

// Minimal HTTP server so Render Web Services pass health checks
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Chartebet Telegram Bot Status: Active\n');
}).listen(PORT, () => {
  console.log(`Web server listening on port ${PORT}`);
});
