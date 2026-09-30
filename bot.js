import { Telegraf, Markup } from 'telegraf';
import http from 'http';

const BOT_TOKEN = process.env.BOT_TOKEN || '8612862555:AAEs2aeeB2WSg3WCC5XMEUka2NBuoOpCGHA';
const GAME_URL = 'https://chartebet.onrender.com/';

const bot = new Telegraf(BOT_TOKEN);

// 1. /start command
bot.command('start', (ctx) => {
  return ctx.reply(
    '👋 Welcome! Please share your phone number to register:',
    Markup.keyboard([
      [Markup.button.contactRequest('📱 Share Phone Number')]
    ]).resize().oneTime()
  );
});

// 2. /website command
bot.command('website', (ctx) => {
  return ctx.reply(
    '🌐 Visit CharteBet online:',
    Markup.inlineKeyboard([
      [Markup.button.url('🌐 Open Website', GAME_URL)]
    ])
  );
});

// 3. /games command
bot.command('games', (ctx) => {
  return ctx.reply(
    '🎮 Play Aviator, Chicken Road, Keno, and more!',
    Markup.inlineKeyboard([
      [Markup.button.webApp('🚀 Play Games', GAME_URL)]
    ])
  );
});

// 4. /sports command
bot.command('sports', (ctx) => {
  return ctx.reply(
    '⚽ Live sports betting and match odds:',
    Markup.inlineKeyboard([
      [Markup.button.url('⚽ Sports Betting', GAME_URL)]
    ])
  );
});

// 5. /wallet command
bot.command('wallet', (ctx) => {
  return ctx.reply(
    '💳 Wallet & Balance Management:',
    Markup.inlineKeyboard([
      [Markup.button.webApp('💰 Open Wallet', GAME_URL)]
    ])
  );
});

// 6. /help command
bot.command('help', (ctx) => {
  return ctx.reply(
    '🆘 Need assistance?\n\n' +
    '💬 Support: @Chartebetsupport\n' +
    '💳 Payments: @Chartebetpayment'
  );
});

// 7. Contact share handler (Passes phone to WebApp for auto sign-in)
bot.on('contact', async (ctx) => {
  const phoneNumber = ctx.message.contact.phone_number;
  const userGameUrl = `${GAME_URL}?phone=${encodeURIComponent(phoneNumber)}`;

  await ctx.reply(`✅ Thanks! You're now registered with ${phoneNumber}.`);

  await ctx.reply(
    "🎰 It's Game Time! Good Luck!",
    Markup.inlineKeyboard([
      [Markup.button.webApp('8️⃣ Start Playing', userGameUrl)]
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

// 8. Reply Keyboard Button Handlers
bot.hears('🎮 Play Games', (ctx) => {
  return ctx.reply(
    '🎰 Ready to play?',
    Markup.inlineKeyboard([
      [Markup.button.webApp('8️⃣ Open Game App', GAME_URL)]
    ])
  );
});

bot.hears('🎁 Invite Friends', (ctx) => {
  const userId = ctx.from.id;
  const refLink = `https://t.me/Chartebetbot?start=${userId}`;
  const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${encodeURIComponent('Join CharteBet and start playing!')}`;

  return ctx.reply(
    `🎁 Invite your friends and earn bonus rewards!\n\nYour Referral Link:\n${refLink}`,
    Markup.inlineKeyboard([
      [Markup.button.url('📲 Share Link', shareUrl)]
    ])
  );
});

bot.hears('🆘 Support', (ctx) => {
  return ctx.reply(
    '🆘 Need assistance or payment help?\n\n' +
    '💬 Customer Support: @Chartebetsupport\n' +
    '💳 Payments & Deposits: @Chartebetpayment'
  );
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
