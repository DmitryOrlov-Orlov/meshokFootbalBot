const TelegramBot = require('node-telegram-bot-api');
const { google } = require('googleapis');
const config = require('./config');
const helper = require('./helper');

helper.logStart();
const bot = new TelegramBot(config.TOKEN, {
  polling: true
})

let flag = 0;
let chatId = '';
let max = 0;
bot.on('message', msg => {
  console.log(msg);
  max = Number(msg.text);
  if (max >= 1 && max <= 15 && flag === 1) {
    max = Number(msg.text);
    bot.sendPoll(chatId,
      `Надо набрать ${msg.text} мешков!`,
      ['Да', 'Нет', 'Незнаю', 'Если народу не хватит, то я +++'], {
      is_closed: false,
      is_anonymous: false
    })
  }
  flag = 0;
})

bot.on('message', msg => {
  if (msg.text === '/start@SundayFootballVote_bot' || msg.text === '/start') {
    flag++;
    chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Сколько мешков надо на игру?', {
      reply_markup: {
        keyboard: [
          ['1', '7', '8', '9'],
          ['10'],
          ['11', '12', '13', '14', '15']
        ],
        one_time_keyboard: true,
        force_reply: false
      },
    })
  }
})

bot.on('poll', poll => {
  const voterCount = poll.options[0].voter_count;
  console.log(poll);
  if (voterCount == max) {
    bot.sendMessage(chatId, 'Голосование закончено. \nВсех мешков попрошу не опаздывать.');
    return;
  }
})

/* console.log('YOUTUBE_TOKEN',);
google.youtube('v3').search.list({
  key: 'UCc5cX1qMCdRY0Vm1tL4KKqg',
  part: 'snippet',
  q: 'joji',
})
  .then((response) => {
    console.lo(response);
  }) */
/* var youtube = google.youtube({
  version: 'v3',
  auth: "UCc5cX1qMCdRY0Vm1tL4KKqg&list=PLNIKmHiw_fIbVM7VLZLSRSDFGLpnNuuse&index"
}); */
/* youtube.search.list({
  part: 'snippet',
  q: 'your search query'
}, function (err, data) {
  if (err) {
    console.error('Error: ' + err);
  }
  if (data) {
    console.log(data)
  }
}); */