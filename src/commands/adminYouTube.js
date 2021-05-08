module.exports = {
  adminShowYouTubeURL_All(Games, bot, msg, adminRuslanId, adminEgorId) {
    if (adminRuslanId === msg.from.id || adminEgorId === msg.from.id) {
      Games.find({}, (err, game) => {
        if (game.length === 0) {
          bot.sendMessage(msg.from.id, `База данных пуста!`);
          return;
        }
        let listGames = '';
        for (key in game) {
          let year = game[key].gameDate.toISOString().split("-")[0];
          let month = game[key].gameDate.toISOString().split("-")[1];
          let day = game[key].gameDate.toISOString().split("-")[2].split('T')[0];
          let date = `${day}.${month}.${year}`;
          let review = `Обзор - ${game[key].urlYoutubeFull}\n`;
          let full = `Полное видео - ${game[key].urlYoutubeReview}\n`;
          let left = `Левая половина - ${game[key].urlYoutubeLeftHalf}\n`;
          let right = `Правая половина - ${game[key].urlYoutubeRightHalf}\n`;
          listGames += `${game[key].numberId}) ${date}\n${review}${full}${left}${right}\n`;
        }
        bot.sendMessage(msg.from.id, `Все ссылки на YouTube: \n\n${listGames}`, {
          disable_web_page_preview: true
        });
      })
        .sort({ numberId: 1 })
    } else {
      bot.sendMessage(msg.from.id, "Ошибка. Данная команда доступна администратору.\n/help - помощь")
    }
  },
  adminShowYouTubeURL_10(Games, bot, msg, adminRuslanId, adminEgorId) {
    if (adminRuslanId === msg.from.id || adminEgorId === msg.from.id) {
      Games.find({}, (err, game) => {
        if (game.length === 0) {
          bot.sendMessage(msg.from.id, `База данных пуста!`);
          return;
        }
        let listGames = '';
        for (key in game) {
          let year = game[key].gameDate.toISOString().split("-")[0];
          let month = game[key].gameDate.toISOString().split("-")[1];
          let day = game[key].gameDate.toISOString().split("-")[2].split('T')[0];
          let date = `${day}.${month}.${year}`
          let review = `Обзор - ${game[key].urlYoutubeFull}\n`;
          let full = `Полное видео - ${game[key].urlYoutubeReview}\n`;
          let left = `Левая половина - ${game[key].urlYoutubeLeftHalf}\n`;
          let right = `Правая половина - ${game[key].urlYoutubeRightHalf}\n`;
          listGames += `${game[key].numberId}) ${date}\n${review}${full}${left}${right}\n`;
        }
        bot.sendMessage(msg.from.id, `Последние 10 ссылок на YouTube: \n\n${listGames}`, {
          disable_web_page_preview: true
        });
      })
        .sort({ numberId: 1 })
        .limit(10)
    } else {
      bot.sendMessage(msg.from.id, "Ошибка. Данная команда доступна администратору.\n/help - помощь")
    }
  },
  adminAddYouTubeURL_Review(Games,
    bot,
    msg,
    adminRuslanId,
    adminEgorId,
    numberId,
    URl) {
    if (/^\d+$/.test(numberId) === false) {
      bot.sendMessage(msg.from.id, 'Ошибка. Введите целое число!');
      return;
    }
    if (adminRuslanId === msg.from.id || adminEgorId === msg.from.id) {
      Games.find({}, (err, game) => {
        if (numberId > game.length) {
          bot.sendMessage(msg.from.id, 'Ошибка. вы указали не верное число!\n/adminAddYouTubeURL_Review (N) (Link). Где N - это порядковый номер, а Link - это ссылка на обзор матча.');
          return;
        }
        if (game.length === 0) {
          bot.sendMessage(msg.from.id, `База пуста.`);
          return;
        } else {
          Games.findOneAndUpdate({ numberId: numberId }, {
            $set: { urlYoutubeReview: URl },
          }, { multi: true }, (e, data) => {
            console.log(`Записали urlYoutubeReview: ${URl}`);
            bot.sendMessage(msg.from.id, `Хорошо, вы записали ссылку!\n\n/adminShowYouTubeURL_10 - показать последние 10 ссылок на YouTube`, {
              disable_web_page_preview: true
            });
          })
        }
      })
    }
  },
  adminAddYouTubeURL_Full(Games,
    bot,
    msg,
    adminRuslanId,
    adminEgorId,
    numberId,
    URl) {
    if (/^\d+$/.test(numberId) === false) {
      bot.sendMessage(msg.from.id, 'Ошибка. Введите целое число!');
      return;
    }
    if (adminRuslanId === msg.from.id || adminEgorId === msg.from.id) {
      Games.find({}, (err, game) => {
        if (numberId > game.length) {
          bot.sendMessage(msg.from.id, 'Ошибка. вы указали не верное число!\n/adminAddYouTubeURL_Full (N) (Link). Где N - это порядковый номер, а Link - это ссылка на полный матч.');
          return;
        }
        if (game.length === 0) {
          bot.sendMessage(msg.from.id, `База пуста.`);
          return;
        } else {
          Games.findOneAndUpdate({ numberId: numberId }, {
            $set: { urlYoutubeFull: URl },
          }, { multi: true }, (e, data) => {
            console.log(`Записали urlYoutubeFull: ${URl}`);
            bot.sendMessage(msg.from.id, `Хорошо, вы записали ссылку!\n\n/adminShowYouTubeURL_10 - показать последние 10 ссылок на YouTube`, {
              disable_web_page_preview: true
            });
          })
        }
      })
    }
  },
  adminAddYouTubeURL_LeftHalf(Games,
    bot,
    msg,
    adminRuslanId,
    adminEgorId,
    numberId,
    URl) {
    if (/^\d+$/.test(numberId) === false) {
      bot.sendMessage(msg.from.id, 'Ошибка. Введите целое число!');
      return;
    }
    if (adminRuslanId === msg.from.id || adminEgorId === msg.from.id) {
      Games.find({}, (err, game) => {
        if (numberId > game.length) {
          bot.sendMessage(msg.from.id, 'Ошибка. вы указали не верное число!\n/adminAddYouTubeURL_LeftHalf (N) (Link). Где N - это порядковый номер, а Link - это ссылка на полный матч.');
          return;
        }
        if (game.length === 0) {
          bot.sendMessage(msg.from.id, `База пуста.`);
          return;
        } else {
          Games.findOneAndUpdate({ numberId: numberId }, {
            $set: { urlYoutubeLeftHalf: URl },
          }, { multi: true }, (e, data) => {
            console.log(`Записали urlYoutubeLeftHalf: ${URl}`);
            bot.sendMessage(msg.from.id, `Хорошо, вы записали ссылку!\n\n/adminShowYouTubeURL_10 - показать последние 10 ссылок на YouTube`, {
              disable_web_page_preview: true
            });
          })
        }
      })
    }
  },
  adminAddYouTubeURL_RightHalf(Games,
    bot,
    msg,
    adminRuslanId,
    adminEgorId,
    numberId,
    URl) {
    if (/^\d+$/.test(numberId) === false) {
      bot.sendMessage(msg.from.id, 'Ошибка. Введите целое число!');
      return;
    }
    if (adminRuslanId === msg.from.id || adminEgorId === msg.from.id) {
      Games.find({}, (err, game) => {
        if (numberId > game.length) {
          bot.sendMessage(msg.from.id, 'Ошибка. вы указали не верное число!\n/adminAddYouTubeURL_RightHalf (N) (Link). Где N - это порядковый номер, а Link - это ссылка на полный матч.');
          return;
        }
        if (game.length === 0) {
          bot.sendMessage(msg.from.id, `База пуста.`);
          return;
        } else {
          Games.findOneAndUpdate({ numberId: numberId }, {
            $set: { urlYoutubeRightHalf: URl },
          }, { multi: true }, (e, data) => {
            console.log(`Записали urlYoutubeRightHalf: ${URl}`);
            bot.sendMessage(msg.from.id, `Хорошо, вы записали ссылку!\n\n/adminShowYouTubeURL_10 - показать последние 10 ссылок на YouTube`, {
              disable_web_page_preview: true
            });
          })
        }
      })
    }
  }
}