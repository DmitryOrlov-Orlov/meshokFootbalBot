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
              listGames += `${game[key].numberId}) ${date} - игроков: ${game[key].gameMaxPlayers} - ${game[key].gameOver}\n`;
            }
            bot.sendMessage(msg.from.id, `Список доступных игр в базе: \n${listGames}`)
              .then(() => {
                if (adminRuslanId === msg.from.id || adminEgorId === msg.from.id) {
                  bot.sendMessage(msg.from.id, `/adminCreateCounter - для создания счётчика. Просто введите данныю команду и вторым параметром введите порядковый номер игры.`);
                }
              });
          })
            .sort({ numberId: 1 })
        })
    } else {
      bot.sendMessage(msg.from.id, "Ошибка. Данная команда доступна администратору.\n/help - помощь")
    }
  },
  adminShowGamesAll(Games, bot, msg, adminRuslanId, adminEgorId) {
    if (adminRuslanId === msg.from.id || adminEgorId === msg.from.id) {
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
              let date = `${day}.${month}.${year}`
              listGames += `${game[key].numberId}) ${date} - игроков: ${game[key].gameStat.length} - ${game[key].gameOver}\n`;
            }
            bot.sendMessage(msg.from.id, `Список всех игр в базе: \n${listGames}`);
          })
            .sort({ numberId: 1 })
        })
    } else {
      bot.sendMessage(msg.from.id, "Ошибка. Данная команда доступна администратору.\n/help - помощь")
    }
  },
  adminShowGamesLimit_10(Games, bot, msg, adminRuslanId, adminEgorId) {
    if (adminRuslanId === msg.from.id || adminEgorId === msg.from.id) {
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
              let date = `${day}.${month}.${year}`
              listGames += `${game[key].numberId}) ${date} - игроков: ${game[key].gameStat.length} - ${game[key].gameOver}\n`;
            }
            bot.sendMessage(msg.from.id, `Список последних 10 игр в базе: \n${listGames}`);
          })
            .sort({ numberId: 1 })
            .limit(10)
        })
    } else {
      bot.sendMessage(msg.from.id, "Ошибка. Данная команда доступна администратору.\n/help - помощь")
    }
  }
}