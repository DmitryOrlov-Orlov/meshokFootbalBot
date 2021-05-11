module.exports = {
  adminShowGamesList(Games, bot, msg, adminRuslanId, adminEgorId) {
    if (adminRuslanId === msg.from.id || adminEgorId === msg.from.id) {
      Games.find({}, (err, game) => {
        game.forEach((item, index) => {
          item.numberId = index + 1;
          Games(item).save();
        })
      }).sort({ gameDate: -1 })
        .then(() => {
          Games.find({ gameOver: false }, (err, game) => {
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
              let gameOver = game[key].gameOver ? 'игра закрыта' : 'игра не закрыта';
              listGames += `${game[key].numberId}) ${date} - ${gameOver}, было ${game[key].gameStat.length} игроков\n`;
            }
            bot.sendMessage(msg.from.id, `Список доступных игр в базе: \n${listGames}`)
              .then(() => {
                if (adminRuslanId === msg.from.id || adminEgorId === msg.from.id) {
                  bot.sendMessage(msg.from.id, `/adminCreateCounter (N) - создать счётчик. Где N - это орядковый номер игры.`);
                }
              });
          })
            .sort({ numberId: 1 })
        })
    } else {
      bot.sendMessage(msg.from.id, "Ошибка. Данная команда доступна администратору.\n/help - помощь")
    }
  },
  showGamesAll(Games, bot, msg) {
    Games.find({}, (err, game) => {
      game.forEach((item, index) => {
        item.numberId = index + 1;
        Games(item).save();
      })
    }).sort({ gameDate: -1 })
      .then(() => {
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
            let gameOver = game[key].gameOver ? 'есть статистика' : 'нет статистики';
            listGames += `${game[key].numberId}) ${date} - ${gameOver}, было ${game[key].gameStat.length} игроков\n`;
          }
          bot.sendMessage(msg.from.id, `Список всех игр в базе: \n${listGames}`)
            .then(() => {
              const showGameInformation = `/show_game_information (N) - просмотреть информацию за конкретную игру (статистика/Timeline/ссылки на YouTube). Где N - это порядковый номер.\n`;
              bot.sendMessage(msg.from.id, showGameInformation);
            })
        })
          .sort({ numberId: 1 })
      })

  },
  showGamesLimit_10(Games, bot, msg) {
    Games.find({}, (err, game) => {
      game.forEach((item, index) => {
        item.numberId = index + 1;
        Games(item).save();
      })
    }).sort({ gameDate: -1 })
      .then(() => {
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
            let gameOver = game[key].gameOver ? 'есть статистика' : 'нет статистики';
            listGames += `${game[key].numberId}) ${date} - ${gameOver}, было ${game[key].gameStat.length} игроков\n`;
          }
          bot.sendMessage(msg.from.id, `Список последних 10 игр в базе: \n${listGames}`)
            .then(() => {
              const showGameInformation = `/show_game_information (N) - просмотреть информацию за конкретную игру (статистика/Timeline/ссылки на YouTube). Где N - это порядковый номер.\n`;
              bot.sendMessage(msg.from.id, showGameInformation);
            })
        })
          .sort({ numberId: 1 })
          .limit(10)
      })
  }
}