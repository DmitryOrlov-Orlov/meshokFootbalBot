const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const config = require('./config');
const helper = require('./helper');
const keyboardGamesActions = require('./keyboard-games-actions');
const { debug } = require('./helper');

helper.logStart();
mongoose.Promise = global.Promise;
mongoose.connect(config.DB_URL, { useFindAndModify: false })
  .then(() => console.log('MongoDB connected - users.model'))
  .catch((err) => console.log('ERROR: ', err))
require('./models/users.model');
mongoose.connect(config.DB_URL, { useFindAndModify: false })
  .then(() => console.log('MongoDB connected - games.model'))
  .catch((err) => console.log('ERROR: ', err))
require('./models/games.model');
const Users = mongoose.model('users');
const Games = mongoose.model('games');

const bot = new TelegramBot(config.TOKEN, {
  polling: true
})

//скидываем все счетчики
let adminAddName = 0;
let adminDelPlayer = 0;
let adminChangeNamePlayer = 0;
let createPoll = 0;
bot.on('message', msg => {
  if (msg.text.substr(0, 1) === '/') {
    adminAddName = 0;
    adminDelPlayer = 0;
    adminChangeNamePlayer = 0;
  }
})

bot.onText(/\/help/, msg => {
  bot.sendMessage(msg.from.id, `Что умеет данный бот:\n\nСписок команд доступных пользователю:\n1) /addUser - пользователю нужно закрепиться за своим именем, это позволит нам вести статистику (предварительно нужно сообщить администратору, что бы тот добавил корректное имя в базу).\n2) /listPlayers - показать список пользователей.\n3) /help - помощь.`);
})
bot.onText(/\/x/, msg => {
  bot.sendMessage(msg.from.id, `Что умеет данный бот:\n\nСписок команд доступных пользователю:\n1) /addUser - пользователю нужно закрепиться за своим именем, это позволит нам вести статистику (предварительно нужно сообщить администратору, что бы тот добавил корректное имя в базу).\n2) /listPlayers - показать список пользователей.\n\nСписок команд доступных Администратору: \n1) /adminAddName - создать профиль. \n2) /adminDelPlayer - удалить профиль.\n3) /adminChangeNamePlayer - редактировать имя профиля.\n4) /adminCreatePoll ЧЧ.ММ ДД.ММ.ГГГГ Х\nгде: Х - это количество игроков\n5) /adminShowGamesList - показать игры доступные для создания счётчика\n6) /adminShowGamesAll - показать все игры которые есть в базе\n7) /adminShowGamesLimit_10 - показать последние 10 игр\n8) /adminCreateCounter (X) - создать счётчик статистики. Где X - это порядковый номер игры. \n9) /help - помощь.`);
})

//Добавление НОВОГО ИМЕНИ в базу данных
bot.onText(/\/adminAddName/, msg => {
  if (config.adminRuslanId === msg.from.id || config.adminEgorId === msg.from.id) {
    adminAddName = 1;
    bot.sendMessage(msg.from.id, `Что бы добавить новый профиль, отправьте Имя + Фамилия.\n\n/listPlayers - показать список пользователей`);
  } else {
    bot.sendMessage(msg.from.id, "Ошибка. Данная команда доступна администратору.\n/help - помощь")
  }
})
bot.on('message', msg => {
  if (adminAddName === 1 && msg.text[0] !== '/') {
    Users.find({}, (err, users) => {
      let perem = 0;
      users.length === 0 ? perem = 0 : perem = users[0].numberId;
      Users({
        userId: 0,
        numberId: perem + 1,
        firstName: '',
        logIn: false,
        nikname: msg.text,
        games: 0,
        goals: 0,
        assistant: 0,
        ownGoal: 0,
      }).save()
        .then((user) => {
          bot.sendMessage(msg.from.id, `В базу добавлен - ${user.nikname}.\n\n/listPlayers - показать список пользователей`);
        })
      adminAddName = 0;
    }).sort({ numberId: -1 })
  }
})

//Выводим Список игроков
bot.onText(/\/listPlayers/, msg => {
  Users.find({}, (err, users) => {
    if (users.length === 0) {
      bot.sendMessage(msg.from.id, `База данных пуста! \n\n/adminAddName - добавить профиль`);
      return;
    }
    let listPlayers = '';
    for (key in users) {
      listPlayers += `${users[key].numberId}) ${users[key].nikname} - ${users[key].firstName}\n`;
    }
    bot.sendMessage(msg.from.id, `Список пользователей в базе: \n${listPlayers}`);
    if (config.adminRuslanId === msg.from.id || config.adminEgorId === msg.from.id) {
      bot.sendMessage(msg.from.id, `/adminAddName - добавить профиль\n/adminDelPlayer - удалить профиль\n/adminChangeNamePlayer - изменить имя у пользователя`);
    }
  })
    .sort({ numberId: 1 })
    .then(() => {
      Users.find({}, (err, user) => {
        user.forEach((item, index) => {
          item.numberId = index + 1;
          Users(item).save();
        })
      })
    })
})

//Удалить из базы
bot.onText(/\/adminDelPlayer/, msg => {
  if (config.adminRuslanId === msg.from.id || config.adminEgorId === msg.from.id) {
    adminDelPlayer = 1;
    Users.find({}, (err, users) => {
      if (users.length === 0) {
        adminDelPlayer = 0;
        bot.sendMessage(msg.from.id, `База пуста.\n\n/adminAddName - добавить профиль.`);
        return;
      }
      let listPlayers = '';
      for (key in users) {
        listPlayers += `${users[key].numberId}) ${users[key].nikname} - ${users[key].firstName}\n`;
      }
      bot.sendMessage(msg.chat.id, `Для удаления игрока введите его порядковый номер ...\n\nСписок игроков в базе: \n${listPlayers}`);
    })
  } else {
    bot.sendMessage(msg.from.id, "Ошибка. Данная команда доступна администратору.\n/help - помощь")
  }
})
bot.on('message', msg => {
  if (adminDelPlayer === 1 && msg.text[0] !== '/') {
    if (/^\d+$/.test(msg.text) === false) {
      bot.sendMessage(msg.from.id, 'Ошибка. Введите целое число!');
      return;
    }
    let numberId = Number(msg.text);
    Users.find({}, (err, users) => {
      if (numberId > users.length) {
        bot.sendMessage(msg.from.id, 'Ошибка. вы указали не верное число!');
        return;
      }
      Users.findOne({ numberId: numberId }, (error, user) => {
        bot.sendMessage(msg.from.id, `Был удален: ${user.nikname} - ${user.firstName}\n\n/listPlayers - показать список пользователей`);
        user.remove();
      }).then(() => {
        Users.find({}, (err, user) => {
          user.forEach((item, index) => {
            item.numberId = index + 1;
            Users(item).save();
          })
        })
      })
    })
    adminDelPlayer = 0;
  }
})

//Пользователь региструется в базе данных
let addUser = 0;
bot.onText(/\/addUser/, msg => {
  Users.find({}, (err, users) => {
    if (users.length === 0) {
      addUser = 0;
      bot.sendMessage(msg.from.id, `Извените, база пуста! \n\nОбратитесь к администратору, что бы он добавил ваше Имя за которым Вы сможете закрепится.`);
      return;
    }
    let listPlayers = '';
    addUser = 1;
    for (key in users) {
      listPlayers += `${users[key].numberId}) ${users[key].nikname} - ${users[key].firstName}\n`;
    }
    bot.sendMessage(msg.from.id, `Привет, выбери из списка свое Имя, и отправь порядковый номер. Это позволит сохранить тебя в базе.\n\nСписок пользователей в базе: \n${listPlayers}`);
  }).sort({ numberId: 1 })
})
bot.on('message', msg => {
  if (addUser === 1 && msg.text[0] !== '/') {
    if (/^\d+$/.test(msg.text) === false) {
      bot.sendMessage(msg.from.id, 'Ошибка. Надо ввести число! \nНажмите на /addUser\nИ введите число');
      return;
    }
    let numberId = Number(msg.text);
    Users.find({}, (err, users) => {
      if (numberId > users.length) {
        bot.sendMessage(msg.from.id, 'Ошибка. вы указали не верное число!');
        return;
      }
      if (users[0].userId === msg.from.id) {
        bot.sendMessage(msg.from.id, 'Извените, но вы уже сохранены в базе. Для изменения имени обратитесь к администратору.');
        return;
      }
      Users.findOneAndUpdate({ numberId: numberId }, {
        $set: { userId: msg.from.id, logIn: true, firstName: msg.from.first_name },
      }, { multi: true }, (e, data) => {
        bot.sendMessage(msg.from.id, 'Поздравляю. Вы добавлены в базу.');
        console.log('Поздравляю. Вы добавлены в базу.');
      })
    })
    addUser = 0;
  }
})

//Админ изменяет имя у пользователя
bot.onText(/\/adminChangeNamePlayer/, msg => {
  if (config.adminRuslanId === msg.from.id || config.adminEgorId === msg.from.id) {
    adminChangeNamePlayer = 1;
    Users.find({}, (err, users) => {
      if (users.length === 0) {
        bot.sendMessage(msg.from.id, `Изменять не чего. База данных пуста! \n\n/adminAddName - добавить профиль`);
        return;
      }
      let listPlayers = '';
      for (key in users) {
        listPlayers += `${users[key].numberId}) ${users[key].nikname} - ${users[key].firstName}\n`;
      }
      bot.sendMessage(msg.from.id, `Что бы изменить имя, отправьте Порядковый Номер + Новое Имя\n\nНапример: 1 Иван Иванов \n\nСписок пользователей в базе: \n${listPlayers}\n/listPlayers - показать список пользователей`);
    })
      .sort({ numberId: 1 })
      .then(() => {
        Users.find({}, (err, user) => {
          user.forEach((item, index) => {
            item.numberId = index + 1;
            Users(item).save();
          })
        })
      })
  }
})

bot.on('message', msg => {
  if (adminChangeNamePlayer === 1 && msg.text[0] !== '/') {
    let numberId = msg.text.match(/\d+/g);
    let newNikname = msg.text.replace(/[^a-zа-яё]/gi, ' ').substr(1);
    if (numberId === null || newNikname.length === 0) {
      bot.sendMessage(msg.from.id, 'Ошибка. Введите число + пробел + Новое имя.\n/adminChangeNamePlayer - изменить имя у профиля');
      return;
    }
    Users.find({}, (err, users) => {
      if (numberId > users.length) {
        bot.sendMessage(msg.from.id, 'Ошибка. вы указали не верное число!\n/adminChangeNamePlayer - изменить имя у профиля');
        return;
      }
      Users.findOne({ numberId: numberId }, (error, user) => {
        user.nikname = newNikname;
        Users(user).save();
        bot.sendMessage(msg.from.id, 'Поздравляю. Имя изменено\n\n/listPlayers - показать список пользователей');
        return;
      })
    })
  }
  adminChangeNamePlayer = 0;
})
//С добавлением пользователей закончено
//==========================================================================

//==========================================================================
//Создаем новую сущность  Games
let gameDate = '';
let gameMaxPlayers = 0;

bot.onText(/\/adminCreatePoll (.+) (.+) (.+)/, (msg, [source, time, date, maxPalyers]) => {
  //обработать баг, если /createGame без параметров то выводить на экран
  if (config.adminRuslanId === msg.from.id || config.adminEgorId === msg.from.id) {
    createPoll = 1;
    let year = Number(date.match(/\d+/g)[2]);
    let month = Number(date.match(/\d+/g)[1]) - 1;
    let day = Number(date.match(/\d+/g)[0]);
    let hour = Number(time.match(/\d+/g)[0]) + 5;
    let minutes = Number(time.match(/\d+/g)[1]);
    gameDate = new Date(year, month, day, hour, minutes);
    gameMaxPlayers = maxPalyers;
    bot.sendMessage(msg.chat.id, `Хорошо, вы занесли в базу важные параметры!\n\nМатч состоится ${day}.${month}.${year} в ${hour - 5}:${minutes}.\nВ команде ${maxPalyers} человек.\n\nТеперь напишите вводную информацию для команды (эта инфа пойдет в описание опроса).`);
  } else {
    bot.sendMessage(msg.from.id, "Ошибка. Данная команда доступна администратору.\n/help - помощь")
  }
})

bot.on('message', msg => {
  if (createPoll === 1 && msg.text[0] !== '/') {
    bot.sendPoll(config.groupFootballId,
      msg.text,
      ['Да', 'Нет'], {
      is_closed: false,
      is_anonymous: false
    }).then((dataPoll) => {
      Games.find({}, (err, game) => {
        let perem = 0;
        game.length === 0 ? perem = 0 : perem = game[0].numberId;
        Games({
          gameDate: gameDate,
          numberId: perem + 1,
          pollId: dataPoll.poll.id,
          pollDescription: msg.text,
          gameMaxPlayers: gameMaxPlayers,
          gameStat: [],
          gameOver: false
        }).save()
        bot.sendMessage(msg.chat.id, 'Поздравляю, в чате должен появиться опрос. Проверь!\nЗа два часа до начала игры, голосование закроется.')
      }).sort({ numberId: 1 })
        .then(() => {
          Games.find({}, (err, game) => {
            game.forEach((item, index) => {
              item.numberId = index + 1;
              Games(item).save();
            })
          })
        })
    });
  }
  createPoll = 0;
})

//в базу добавляется человек который проголосовал
bot.on('poll_answer', poll_answer => {
  if (poll_answer.option_ids[0] === 0) {
    Users.find({ userId: poll_answer.user.id }, (err, user) => {
    }).then((user) => {
      Games.findOneAndUpdate(
        { pollId: poll_answer.poll_id },
        {
          $addToSet: {
            gameStat: {
              userId: poll_answer.user.id,
              firstName: poll_answer.user.first_name,
              nikname: user[0].nikname || "не зареган",
              goals: 0,
              assistant: 0,
              ownGoal: 0
            }
          }
        }, { new: true, useFindAndModify: false },
        function (err, data) {
          if (err) throw err;
        }
      )
    })
  } else if (poll_answer.option_ids.length === 0) {//Доделать удаление если отменил голос
    /* Games.updateOne(
      {},
      { $pull: { gameStat: { userId: 698484110 } } },
      { multi: true }
    ) */
  }
})
//вывести на экран список игр доступных для создания счётчика
bot.onText(/\/adminShowGamesList/, msg => {
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
        bot.sendMessage(msg.from.id, `Список доступных игр в базе: \n${listGames}`);
        if (config.adminRuslanId === msg.from.id || config.adminEgorId === msg.from.id) {
          bot.sendMessage(msg.from.id, `/adminCreateCounter - для создания счётчика. Просто введите данныю команду и вторым параметром введите порядковый номер игры.`);
        }
      })
        .sort({ numberId: 1 })
    })
})
//вывести на экран список игр которые есть в базе
bot.onText(/\/adminShowGamesAll/, msg => {
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
        bot.sendMessage(msg.from.id, `Список доступных игр в базе: \n${listGames}`);
      })
        .sort({ numberId: 1 })
    })
})
//вывести на экран список последних 10 игр которые есть в базе
bot.onText(/\/adminShowGamesLimit_10/, msg => {
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
        bot.sendMessage(msg.from.id, `Список доступных игр в базе: \n${listGames}`);
      })
        .sort({ numberId: 1 })
        .limit(10)
    })
})

bot.onText(/\/adminCreateCounter (.+)/, (msg, [source, numberId]) => {
  if (/^\d+$/.test(numberId) === false) {
    bot.sendMessage(msg.from.id, 'Ошибка. Введите целое число!');
    return;
  }
  if (config.adminRuslanId === msg.from.id || config.adminEgorId === msg.from.id) {
    Games.find({ numberId: numberId }, (err, game) => {
      if (game.length === 0) {
        bot.sendMessage(msg.from.id, 'Вы ввели не верное число! Попробуйка еще раз. Введи число которое есть в базе!');
        return;
      }
      if (game[0].gameOver === true) {
        bot.sendMessage(msg.from.id, 'Данная игру уже закрыта! Выберите другую игру.');
        return;
      }
      let keyboardPlayers = [];
      for (item of game[0].gameStat) {
        keyboardPlayers.push([
          {
            text: item.nikname,
            callback_data: `player#${game[0].gameOver}#${game[0].id}#${item.id}`
          }
        ])
      }
      /* keyboardPlayers.push([
        {
          text: '--- Завершить игру ---',
          callback_data: `action#closeGame#${game[0].id}`,
        }
      ]) */
      bot.sendMessage(msg.from.id, 'Хорошо. Теперь давай вести статистику матча. Нажми на игрока, если он что то сделал.', {
        reply_markup: {
          inline_keyboard: keyboardPlayers
        }
      })
    })
  } else {
    bot.sendMessage(msg.from.id, "Ошибка. Данная команда доступна администратору.\n/help - помощь")
  }
})
//если нажали на кнопки(в котором ФИО игрока)
let peremUserIdToGames = '';
let peremGameId = '';
bot.on('callback_query', query => {
  //console.log('query', debug(query));
  let playerAndAction = query.data.split('#')[0];
  let flagAction = query.data.split('#')[1];
  let gameId = query.data.split('#')[2];
  let userIdToGames = query.data.split('#')[3];
  if (flagAction === 'false' && playerAndAction === 'player') {
    Games.find({ _id: gameId }, (err, game) => {
      for (item of game[0].gameStat) {
        if (item.id === userIdToGames) {
          peremGameId = gameId;
          peremUserIdToGames = userIdToGames;
          bot.sendMessage(query.from.id, `Что сделал ${item.nikname}?`, {
            reply_markup: {
              inline_keyboard: keyboardGamesActions
            }
          })
        }
      }
    })
    return;
  }
})
//отрабатываем действия. если забил до занеси в базу обновления
bot.on('callback_query', query => {
  //console.log('callback_query', query);
  let playerAndAction = query.data.split('#')[0];
  let actionAddDel = query.data.split('#')[1];
  if (peremGameId === '') {
    return;
  }
  if (playerAndAction === 'action' && peremUserIdToGames !== '') {
    Games.find({ _id: peremGameId }, (err, game) => {
      let goals = '';
      let ownGoal = '';
      let assistant = '';
      for (item of game[0].gameStat) {
        if (item.id === peremUserIdToGames) {
          goals = item.goals;
          ownGoal = item.ownGoal;
          assistant = item.assistant;
          if (actionAddDel === 'goalDel') {
            goals--;
            Games.findOneAndUpdate({ _id: peremGameId, "gameStat._id": peremUserIdToGames }, {
              $set: { "gameStat.$.goals": goals },
            }, { multi: true }, (e, data) => {
              bot.sendMessage(query.from.id, 'Хорошо. - 1 гол!');
              handlerGamesKeyboard(query.from.id, peremGameId);
            })
            return;
          } else if (actionAddDel === 'goalAdd') {
            goals++;
            Games.findOneAndUpdate({ _id: peremGameId, "gameStat._id": peremUserIdToGames }, {
              $set: { "gameStat.$.goals": goals },
            }, { multi: true }, (e, data) => {
              bot.sendMessage(query.from.id, 'Хорошо. + 1 гол!');
              handlerGamesKeyboard(query.from.id, peremGameId);
              console.log('Записали goalAdd');
            })
            return;
          } else if (actionAddDel === 'ownGoalDel') {
            ownGoal--;
            Games.findOneAndUpdate({ _id: peremGameId, "gameStat._id": peremUserIdToGames }, {
              $set: { "gameStat.$.ownGoal": ownGoal },
            }, { multi: true }, (e, data) => {
              bot.sendMessage(query.from.id, 'Хорошо. - 1 автогол!');
              handlerGamesKeyboard(query.from.id, peremGameId);
              console.log('Записали ownGoalDel');
            })
            return;
          } else if (actionAddDel === 'ownGoalAdd') {
            ownGoal++;
            Games.findOneAndUpdate({ _id: peremGameId, "gameStat._id": peremUserIdToGames }, {
              $set: { "gameStat.$.ownGoal": ownGoal },
            }, { multi: true }, (e, data) => {
              bot.sendMessage(query.from.id, 'Хорошо. + 1 автогол!');
              handlerGamesKeyboard(query.from.id, peremGameId);
              console.log('Записали ownGoalAdd');
            })
            return;
          } else if (actionAddDel === 'assistantDel') {
            assistant--;
            Games.findOneAndUpdate({ _id: peremGameId, "gameStat._id": peremUserIdToGames }, {
              $set: { "gameStat.$.assistant": assistant },
            }, { multi: true }, (e, data) => {
              bot.sendMessage(query.from.id, 'Хорошо. - 1 пас!');
              handlerGamesKeyboard(query.from.id, peremGameId);
              console.log('Записали assistantDel');
            })
            return;
          } else if (actionAddDel === 'assistantAdd') {
            assistant++;
            Games.findOneAndUpdate({ _id: peremGameId, "gameStat._id": peremUserIdToGames }, {
              $set: { "gameStat.$.assistant": assistant },
            }, { multi: true }, (e, data) => {
              bot.sendMessage(query.from.id, 'Хорошо. + 1 пас!');
              handlerGamesKeyboard(query.from.id, peremGameId);
              console.log('Записали assistantAdd');
            })
            return;
          } else if (actionAddDel === 'cancel') {
            bot.sendMessage(query.from.id, 'Окей, отмена действия!');
            handlerGamesKeyboard(query.from.id, peremGameId);
            return;
          } else if (actionAddDel === 'closeGame') {
            let logGoals = 'Голы\n';
            let logAssistant = 'Голевые пасы\n';
            let logOwnGoal = 'Автоголы\n';
            Games.find({ _id: peremGameId }, (err, game) => {
              for (item of game[0].gameStat) {
                logGoals += `${item.nikname} = ${item.goals}\n`;
                logAssistant += `${item.nikname} = ${item.assistant}\n`;
                logOwnGoal += `${item.nikname} = ${item.ownGoal}\n`;
                console.log('game', item);
              }
            }).then((data) => {
              console.log('data', data);
              let date = game[0].gameDate.toISOString().split('T')[0];
              let text = `Поздравляю игра завершена!\n${date}\n\n${logGoals}\n${logAssistant}\n${logOwnGoal}`;
              bot.sendMessage(query.from.id, text);
              Games.findOneAndUpdate({ _id: peremGameId }, {
                $set: { gameOver: true },
              }, { multi: true }, (e, data) => {
                console.log('Записали gameOver: true');
              })
            })
            return;
          }
        }
      }
    })
  }
})
//после того как +1 гол.... создается клавиатура со списком игроков
const handlerGamesKeyboard = (queryFromId, peremGameId) => {
  return (
    Games.find({ _id: peremGameId }, (err, game) => {
      let keyboardPlayers = [];
      for (item of game[0].gameStat) {
        keyboardPlayers.push([
          {
            text: `${item.nikname} Г=${item.goals}/П=${item.assistant}/АГ=${item.ownGoal}`,
            callback_data: `player#${game[0].gameOver}#${game[0].id}#${item.id}`
          }
        ])
      }
      keyboardPlayers.push([
        {
          text: '--- Завершить игру ---',
          callback_data: `action#closeGame#${game[0].id}`,
        }
      ])
      bot.sendMessage(queryFromId, 'Кто еще что сделал?', {
        reply_markup: {
          inline_keyboard: keyboardPlayers
        }
      })
    })
  )
}
