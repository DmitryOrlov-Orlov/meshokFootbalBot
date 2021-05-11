module.exports = {
  showGameInformation(Games, bot, msg, numberId) {
    if (/^\d+$/.test(numberId) === false) {
      bot.sendMessage(msg.from.id, 'Ошибка. Введите целое число!');
      return;
    }
    Games.find({}, (err, game) => {
      if (numberId > game.length || numberId <= 0) {
        bot.sendMessage(msg.from.id, 'Ошибка. вы указали не верное число! Попробуйте еще раз /show_game_information ');
        return;
      }
      if (game.length === 0) {
        bot.sendMessage(msg.from.id, `База пуста.`);
        return;
      } else {
        Games.find({ numberId: numberId }, (err, game) => {
          let text = '';
          let date = game[0].gameDate.toISOString().split('T')[0];
          let description = game[0].pollDescription;
          let urlYoutubeReview = game[0].urlYoutubeReview;
          let urlYoutubeFull = game[0].urlYoutubeFull;
          let urlYoutubeLeftHalf = game[0].urlYoutubeLeftHalf;
          let urlYoutubeRightHalf = game[0].urlYoutubeRightHalf;
          let logGoals = 'Голы\n';
          let logAssistant = 'Голевые пасы\n';
          let logOwnGoal = 'Автоголы\n';
          for (item of game[0].gameStat.sort((a, b) => a.goals > b.goals ? -1 : 1)) {
            if (item.goals > 0) {
              logGoals += `${item.nikname} = ${item.goals}\n`;
            }
          }
          for (item of game[0].gameStat.sort((a, b) => a.assistant > b.assistant ? -1 : 1)) {
            if (item.assistant > 0) {
              logAssistant += `${item.nikname} = ${item.assistant}\n`;
            }
          }
          for (item of game[0].gameStat.sort((a, b) => a.ownGoal > b.ownGoal ? -1 : 1)) {
            if (item.ownGoal > 0) {
              logOwnGoal += `${item.nikname} = ${item.ownGoal}\n`;
            }
          }
          let logtext = game[0].log.split('*');
          let logtextRes = `Timeline матча ${date}\n`;
          logtext.forEach((item) => {
            logtextRes += `${item}\n`;
          })
          let url = `Ссылки к этому матчу:\nОбзор игры - ${urlYoutubeReview}\nВесь матч - ${urlYoutubeFull}\nЛевая половина поля - ${urlYoutubeLeftHalf}\nПравая половина поля - ${urlYoutubeRightHalf}`;
          text = `Статистика за матч от ${date}\nОписание: ${description}\n\n${logGoals}\n${logAssistant}\n${logOwnGoal}`;
          bot.sendMessage(msg.from.id, text);
          bot.sendMessage(msg.from.id, logtextRes)
            .then(() => {
              bot.sendMessage(msg.from.id, url, {
                disable_web_page_preview: true
              });
            })
        })
      }
    })
  }
}