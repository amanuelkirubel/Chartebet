import { Telegraf, Markup } from 'telegraf';
import http from 'http';

const BOT_TOKEN = process.env.BOT_TOKEN;
const GAME_URL = 'https://chartebet.onrender.com/';

const bot = new Telegraf(BOT_TOKEN);

// In-memory session store for multi-step flows
const userSessions = {};

// 1. /start command
bot.command('start', (ctx) => {
  return ctx.reply(
    '👋 Welcome! Please share your phone number to register:',
    Markup.keyboard([
      [Markup.button.contactRequest('📱 Share Phone Number')]
    ]).resize().oneTime()
  );
});

// Command Shortcuts
bot.command('website', (ctx) => {
  return ctx.reply('🌐 Visit CharteBet online:', Markup.inlineKeyboard([[Markup.button.url('🌐 Open Website', GAME_URL)]]));
});

bot.command('games', (ctx) => {
  return ctx.reply('🎮 Play Aviator, Chicken Road, Keno, and more!', Markup.inlineKeyboard([[Markup.button.webApp('🚀 Play Games', GAME_URL)]]));
});

bot.command('sports', (ctx) => {
  return ctx.reply('⚽ Live sports betting and match odds:', Markup.inlineKeyboard([[Markup.button.url('⚽ Sports Betting', GAME_URL)]]));
});

bot.command('wallet', (ctx) => {
  return ctx.reply('💳 Wallet & Balance Management:', Markup.inlineKeyboard([[Markup.button.webApp('💰 Open Wallet', GAME_URL)]]));
});

bot.command('help', (ctx) => {
  return ctx.reply('🆘 Need assistance?\n\n💬 Support: @Chartebetsupport\n💳 Payments: @Chartebetpayment');
});

// 2. Contact Share Handler
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
      ['💰 Deposit', '💸 Withdrawal'],
      ['🎁 Invite Friends', '🆘 Support']
    ]).resize()
  );
});
// 3. Menu Button Handlers
bot.hears('🎮 Play Games', (ctx) => {
  return ctx.reply('🎰 Ready to play?', Markup.inlineKeyboard([[Markup.button.webApp('8️⃣ Open Game App', GAME_URL)]]));
});

bot.hears('🎁 Invite Friends', (ctx) => {
  const userId = ctx.from.id;
  const refLink = `https://t.me/Chartebetbot?start=${userId}`;
  const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${encodeURIComponent('Join CharteBet and start playing!')}`;

  return ctx.reply(
    `🎁 Invite your friends and earn bonus rewards!\n\nYour Referral Link:\n${refLink}`,
    Markup.inlineKeyboard([[Markup.button.url('📲 Share Link', shareUrl)]])
  );
});

bot.hears('🆘 Support', (ctx) => {
  return ctx.reply(
    '🆘 Need assistance or payment help?\n\n' +
    '💬 Customer Support: @Chartebetsupport\n' +
    '💳 Payments & Deposits: @Chartebetpayment'
  );
});

// 4. Deposit Flow Trigger
bot.hears('💰 Deposit', (ctx) => {
  const userId = ctx.from.id;
  userSessions[userId] = { step: 'AWAITING_DEPOSIT_AMOUNT' };
  return ctx.reply('💰 Deposit Request\n\nEnter the amount you want to deposit:');
});

// 5. Withdrawal Flow Trigger
bot.hears('💸 Withdrawal', (ctx) => {
  const userId = ctx.from.id;
  userSessions[userId] = { step: 'AWAITING_WITHDRAW_AMOUNT' };
  return ctx.reply('💸 Withdrawal Request\n\nEnter the amount you want to withdrawal:');
});
// 6. Text Message Handler for Multi-step Inputs
bot.on('text', async (ctx, next) => {
  const userId = ctx.from.id;
  const text = ctx.message.text.trim();
  const session = userSessions[userId];

  if (!session || text.startsWith('/')) {
    return next();
  }

  // Handle Deposit Amount Input
  if (session.step === 'AWAITING_DEPOSIT_AMOUNT') {
    if (isNaN(text) || Number(text) <= 0) {
      return ctx.reply('⚠️ Please enter a valid numerical amount.');
    }
    session.amount = text;
    session.step = 'AWAITING_DEPOSIT_PHONE';
    return ctx.reply(`Amount: BR ${text}\n\nEnter your Chartebet phone number:`);
  }

  // Handle Deposit Phone Input
  if (session.step === 'AWAITING_DEPOSIT_PHONE') {
    session.phone = text;
    session.step = null; // Reset flow state

    return ctx.reply(
      `📋 DEPOSIT Summary\n\nAmount: BR ${session.amount}\nAccount: ${session.phone}\n\nConfirm?`,
      Markup.inlineKeyboard([
        [Markup.button.callback('✅ Confirm', `dep_confirm_${session.amount}_${session.phone}`)],
        [Markup.button.callback('❌ Cancel', 'dep_cancel')]
      ])
    );
  }

  // Handle Withdrawal Amount Input
  if (session.step === 'AWAITING_WITHDRAW_AMOUNT') {
    if (isNaN(text) || Number(text) <= 0) {
      return ctx.reply('⚠️ Please enter a valid numerical amount.');
    }
    session.amount = text;
    session.step = 'AWAITING_WITHDRAW_PHONE';
    return ctx.reply(`Amount: BR ${text}\n\nEnter your Chartebet phone number:`);
  }

  // Handle Withdrawal Phone Input
  if (session.step === 'AWAITING_WITHDRAW_PHONE') {
    session.phone = text;
    session.step = null; // Reset flow state

    return ctx.reply(
      `📋 WITHDRAWAL Summary\n\nAmount: BR ${session.amount}\nAccount: ${session.phone}\n\nConfirm?`,
      Markup.inlineKeyboard([
        [Markup.button.callback('✅ Confirm', `with_confirm_${session.amount}_${session.phone}`)],
        [Markup.button.callback('❌ Cancel', 'with_cancel')]
      ])
    );
  }

  return next();
});
// 7. Inline Button Actions for Deposit
bot.action(/dep_confirm_(.+)_(.+)/, async (ctx) => {
  await ctx.answerCbQuery();
  const userAlias = ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name;

  await ctx.reply(
    `✅ Request submitted!\n\nYour alias: ${userAlias}\nWaiting for an agent to accept...\n\nYou'll be notified when an agent is assigned.`
  );

  return ctx.reply(
    `💳 Agent Payment Details:\n\n` +
    `🏦 Bank: TeleBirr\n` +
    `👤 Account Holder: Amanuel Meles\n` +
    `🔢 Account Number: 251908525960\n\n` +
    `Please send payment to this account and confirm once done.`
  );
});

bot.action('dep_cancel', async (ctx) => {
  await ctx.answerCbQuery();
  return ctx.editMessageText('❌ Deposit request canceled.');
});

// 8. Inline Button Actions for Withdrawal
bot.action(/with_confirm_(.+)_(.+)/, async (ctx) => {
  await ctx.answerCbQuery();
  const [, amount, phone] = ctx.match;

  return ctx.reply(
    `✅ Request submitted!\n\n` +
    `Your withdrawal request of BR ${amount} for account ${phone} is waiting for an agent to accept.\n\n` +
    `You'll be notified once processed.`
  );
});

bot.action('with_cancel', async (ctx) => {
  await ctx.answerCbQuery();
  return ctx.editMessageText('❌ Withdrawal request canceled.');
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
