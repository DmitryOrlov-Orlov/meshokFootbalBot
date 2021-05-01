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
  const commandUser = `Что умеет данный бот:\n\nСписок команд доступных пользователю:\n1) /adduser - пользователю нужно закрепиться за своим именем, это позволит нам вести статистику (предварительно нужно сообщить администратору, что бы тот добавил корректное имя в базу).\n2) /listplayers - показать список пользователей.\n3) /help - помощь.`
  bot.sendMessage(msg.from.id, commandUser);
})
bot.onText(/\/start/, msg => {
  bot.sendMessage(msg.from.id, `Данный бот может вести статистику матча(голы / голевые пасы / автоголы).Для этого Вам необходимо сказать администратору что бы он добавил Ваше имя в базу, после чего вы сможете закрепиться за своим именем.Если этого не сделаете, статистики на вас не будет.  /listplayers - показать список имен. /adduser - закрепиться за своим именем.`);
})
bot.onText(/\/x/, msg => {
  if (config.adminRuslanId === msg.from.id || config.adminEgorId === msg.from.id) {
    const commandUser = `Список команд доступных пользователю: \n1) /adduser - пользователю нужно закрепиться за своим именем, это позволит нам вести статистику(предварительно нужно сообщить администратору, что бы тот добавил корректное имя в базу).\n2) /listplayers - показать список пользователей.`;
    let commandAdmin = `Список команд доступных Администратору: \n1) /adminAddName - создать профиль. \n2) /adminDelPlayer - удалить профиль.\n3) /adminChangeNamePlayer - редактировать имя профиля.\n4) /adminCreatePoll (ЧЧ.ММ) (ДД.ММ.ГГГГ) (Х) - сохдать опрос. Где ЧЧ.ММ - это время, ДД.ММ.ГГГГ - это дата, Х - это количество игроков.\n5) /adminShowGamesList - показать игры доступные для создания счётчика.\n6) /adminShowGamesAll - показать все игры которые есть в базе.\n7) /adminShowGamesLimit_10 - показать последние 10 игр.\n8) /adminCreateCounter (N) - создать счётчик статистики. Где N - это порядковый номер игры.\n9) /adminShowYouTubeURL_All - показать все ссылки на YouTube.\n`;
    commandAdmin += `10) /adminShowYouTubeURL_10 - показать последние 10 ссылок на YouTube.\n11) /adminAddYouTubeURL_Review (N) (Link) - добавить ссылку на обзор матча. Где N - это порядковый номер. Link - это ссылка на обзор матча.\n12) /adminAddYouTubeURL_Full (N) (Link) - добавить ссылку на полный матч. Где N - это порядковый номер. Link - это ссылка на полный матч.\n13) /help - помощь.`;
    bot.sendMessage(msg.from.id, `Что умеет данный бот:\n\n${commandUser}\n\n${commandAdmin}`);
  }
})

//Добавление НОВОГО ИМЕНИ в базу данных
bot.onText(/\/adminAddName/, msg => {
  if (config.adminRuslanId === msg.from.id || config.adminEgorId === msg.from.id) {
    adminAddName = 1;
    bot.sendMessage(msg.from.id, `Что бы добавить новый профиль, отправьте Имя Фамилия.\n\n/listplayers - показать список пользователей`);
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
          bot.sendMessage(msg.from.id, `В базу добавлен - ${user.nikname}.\n\n/adminAddName - добавить профиль\n/listplayers - показать список пользователей`);
        })
      adminAddName = 0;
    }).sort({ numberId: -1 })
  }
})
//Выводим Список игроков
bot.onText(/\/listplayers/, msg => {
  Users.find({}, (err, users) => {
    if (users.length === 0 && config.adminRuslanId === Number(msg.from.id) || config.adminEgorId === Number(msg.from.id)) {
      bot.sendMessage(msg.from.id, `База данных пуста! \n\n/adminAddName - добавить профиль`);
      return;
    }
    if (users.length === 0) {
      console.log(users.length === 0 && config.adminRuslanId !== Number(msg.from.id) || config.adminEgorId !== Number(msg.from.id));
      bot.sendMessage(msg.from.id, `База данных пуста! Обратитесь к администратору.`);
      return;
    }
    let listPlayers = '';
    for (key in users) {
      listPlayers += `${users[key].numberId}) ${users[key].nikname} - ${users[key].firstName}\n`;
    }
    bot.sendMessage(msg.from.id, `Список пользователей в базе: \n${listPlayers}`)
      .then(() => {
        if (config.adminRuslanId === Number(msg.from.id) || config.adminEgorId === Number(msg.from.id)) {
          bot.sendMessage(msg.from.id, `/adminAddName - добавить профиль\n/adminDelPlayer - удалить профиль\n/adminChangeNamePlayer - изменить имя у пользователя`);
        } else {
          bot.sendMessage(msg.from.id, `/adduser - закрепиться за своим именем`);
        }
      })
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
    let numberId = Number(msg.text);
    if (numberId <= 0) {
      bot.sendMessage(msg.from.id, 'Ошибка. Число отрицательное либо 0! \nНажмите на /adminDelPlayer\nИ введите порядковый номер.');
      return;
    }
    if (/^\d+$/.test(msg.text) === false) {
      bot.sendMessage(msg.from.id, 'Ошибка. Надо ввести число! \nНажмите на /adminDelPlayer\nИ введите число.');
      adminDelPlayer = 0;
      return;
    }
    Users.find({}, (err, users) => {
      if (numberId > users.length) {
        bot.sendMessage(msg.from.id, 'Ошибка. вы указали не верное число! Нажмите на /adminDelPlayer\nИ введите число.');
        return;
      }
      Users.findOne({ numberId: numberId }, (error, user) => {
        bot.sendMessage(msg.from.id, `Был удален: ${user.nikname} - ${user.firstName}\n/listplayers - показать список пользователей.`);
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
bot.onText(/\/adduser/, msg => {
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
    let numberId = Number(msg.text);
    let flag = 0;
    if (numberId <= 0) {
      bot.sendMessage(msg.from.id, 'Ошибка. Число отрицательное либо 0! \nНажмите на /adduser\nИ введите порядковый номер.');
      return;
    }
    if (/^\d+$/.test(msg.text) === false) {
      bot.sendMessage(msg.from.id, 'Ошибка. Надо ввести число! \nНажмите на /adduser\nИ введите число.');
      return;
    }
    Users.find({}, (err, users) => {
      if (numberId > users.length) {
        bot.sendMessage(msg.from.id, 'Ошибка. вы указали не верное число!\nНажмите на /adduser\nИ введите порядковый номер.');
      } else {
        for (key in users) {
          if (users[key].userId === msg.from.id) {
            flag = 1;
            bot.sendMessage(msg.from.id, 'Извените, но вы уже сохранены в базе. Если хотите изменить имя, обратитесь к администратору.');
            return;
          }
          if (users[key].logIn === true && users[key].numberId === numberId) {
            bot.sendMessage(msg.from.id, 'Извените, но за этим именем уже закрепился человек!\nНажмите на /adduser\nИ введите порядковый номер.');
            return;
          }
        }
        if (flag === 0) {
          console.log('будем регать');
          Users.findOneAndUpdate({ numberId: numberId }, {
            $set: { userId: msg.from.id, logIn: true, firstName: msg.from.first_name },
          }, { multi: true }, (e, data) => {
            bot.sendMessage(msg.from.id, 'Поздравляю. Вы добавлены в базу.');
            console.log('Поздравляю. Вы добавлены в базу.');
          })
          return;
        }
      }
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
      bot.sendMessage(msg.from.id, `Что бы изменить Имя, отправьте Порядковый Номер и Новое Имя\n\nНапример: 1Иван Иванов \n\nСписок пользователей в базе: \n${listPlayers}\n/listplayers - показать список пользователей`);
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
    let newNikname = msg.text.replace(/[^a-zA-ZА-Яа-яЁё]/gi, '').replace(/\s+/gi, ', ');
    if (numberId === null || newNikname.length === 0) {
      bot.sendMessage(msg.from.id, 'Ошибка. \nНажмите на /adminChangeNamePlayer\nИ введите порядковый номер и новое имя.');
      return;
    }
    Users.find({}, (err, users) => {
      if (numberId > users.length) {
        bot.sendMessage(msg.from.id, 'Ошибка. вы указали не верное число!\n/adminChangeNamePlayer - изменить имя у профиля');
        return;
      }
      Users.findOne({ numberId: numberId }, (error, user) => {
        user.nikname = newNikname.trim();
        Users(user).save();
        bot.sendMessage(msg.from.id, 'Поздравляю. Имя изменено\n\n/listplayers - показать список пользователей');
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
  //обработать баг, если /createGame много параметров на экране!!!!!!!!!!!!!!!
  if (config.adminRuslanId === msg.from.id || config.adminEgorId === msg.from.id) {
    createPoll = 1;
    let year = Number(date.match(/\d+/g)[2]);
    let month = Number(date.match(/\d+/g)[1]) - 1;
    let day = Number(date.match(/\d+/g)[0]);
    let hour = Number(time.match(/\d+/g)[0]) + 5;
    let minutes = Number(time.match(/\d+/g)[1]);
    gameDate = new Date(year, month, day, hour, minutes);
    gameMaxPlayers = maxPalyers;
    bot.sendMessage(msg.chat.id, `Хорошо, игра состоится ${day}.${month}.${year} в ${hour - 5}:${minutes}.\nВ команде ${maxPalyers} человек.\n\nТеперь напишите вводную информацию для команды (эта инфа пойдет в описание опроса).`);
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
          urlYoutubeFull: '',
          urlYoutubeReview: '',
          gameOver: false,
          log: ''
        }).save()
        bot.sendMessage(msg.chat.id, 'Поздравляю, в чате должен появиться опрос. Проверь!\nЗа два часа до начала игры, голосование закроется.')
      }).sort({ numberId: 1 })
        .then(() => {
          Games.find({}, (err, game) => {
            game.forEach((item, index) => {
              item.numberId = index + 1;
              Games(item).save();
            })
          }).sort({ gameDate: -1 })
        })
    });
  }
  createPoll = 0;
})

//в базу добавляется человек который проголосовал
bot.on('poll_answer', poll_answer => {
  if (poll_answer.option_ids[0] === 0) {
    Users.find({ userId: poll_answer.user.id }, (err, user) => {
      if (user.length === 0) {
        return;
      }
      Games.findOneAndUpdate(
        { pollId: poll_answer.poll_id },
        {
          $addToSet: {
            gameStat: {
              userId: poll_answer.user.id,
              firstName: poll_answer.user.first_name,
              nikname: user[0].nikname,
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
        bot.sendMessage(msg.from.id, `Список доступных игр в базе: \n${listGames}`)
          .then(() => {
            if (config.adminRuslanId === msg.from.id || config.adminEgorId === msg.from.id) {
              bot.sendMessage(msg.from.id, `/adminCreateCounter - для создания счётчика. Просто введите данныю команду и вторым параметром введите порядковый номер игры.`);
            }
          });
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
  console.log('numberId', numberId);
  if (/^\d+$/.test(numberId) === false) {
    bot.sendMessage(msg.from.id, 'Ошибка. Введите целое число!');
    return;
  }
  if (config.adminRuslanId === msg.from.id || config.adminEgorId === msg.from.id) {
    Games.find({ numberId: numberId }, (err, game) => {
      if (game.length === 0) {
        bot.sendMessage(msg.from.id, 'Вы ввели не верное число! Попробуйте еще раз. /adminCreateCounter');
        return;
      }
      if (game[0].gameOver === true) {
        bot.sendMessage(msg.from.id, 'Данная игра уже закрыта! Выберите другую игру.');
        return;
      }
      let keyboardPlayers = [];
      let gameDate = game[0].gameDate.toISOString().split('T')[0];
      keyboardPlayers.push([{
        text: '--- Старт ---',
        callback_data: `action#start#${game[0].id}`,
      }])
      for (item of game[0].gameStat) {
        keyboardPlayers.push([
          {
            text: item.nikname,
            callback_data: `player#${game[0].gameOver}#${game[0].id}#${item.id}`
          }
        ])
      }
      bot.sendMessage(msg.from.id, `Хорошо.\nДата матча ${gameDate}. \nОдновременно:\n1) Начните матч\n2) Начните записывать видео\n3) Нажмите кнопку "Старт"\nИли для продолжения матча нажмите на игрока.`, {
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
  let playerAndAction = query.data.split('#')[0];
  let actionAddDel = query.data.split('#')[1];
  let startId = query.data.split('#')[2];

  if (actionAddDel === 'start' && startId !== '') {
    bot.sendMessage(query.from.id, 'Хорошо. Время задано!')
      .then(() => {
        let newDate = new Date;
        newDate.setMilliseconds(5 * 60 * 60 * 1000);
        Games.findOneAndUpdate({ _id: startId }, {
          $set: { gameDate: newDate },
        }, { multi: true }, (e, data) => {
          console.log('Записали start');
        })
        handlerGamesKeyboard(query.from.id, startId);
      })
    return;
  }
  if (peremGameId === '') {
    return;
  }
  if (playerAndAction === 'action' && peremUserIdToGames !== '') {
    Games.find({ _id: peremGameId }, (err, game) => {
      let goals = '';
      let ownGoal = '';
      let assistant = '';
      let nikname = '';
      for (item of game[0].gameStat) {
        if (item.id === peremUserIdToGames) {
          nikname = item.nikname;
        }
        if (item.id === peremUserIdToGames) {
          let newDate = new Date;
          let newDateHour = Number(newDate.toISOString().split('T')[1].split(':')[0]) + 5;
          let newDateMinute = Number(newDate.toISOString().split('T')[1].split(':')[1]);
          let s = Number(newDate.toISOString().split(':')[2].split('.')[0]);
          let gameDateHour = Number(game[0].gameDate.toISOString().split('T')[1].split(':')[0]);
          let gameDateMinute = Number(game[0].gameDate.toISOString().split('T')[1].split(':')[1]);
          let newDateToHour = (newDateHour * 60) + newDateMinute;
          let gameDateToHour = (gameDateHour * 60) + gameDateMinute;
          let resToMin = newDateToHour - gameDateToHour;
          let h = Math.floor(resToMin / 60);
          let m = resToMin - (h * 60);
          if (String(h).length === 1) {
            h = `0${h}`;
          }
          if (String(m).length === 1) {
            m = `0${m}`;
          }
          if (String(s).length === 1) {
            s = `0${s}`;
          }
          let stopwatchLog = `${h}:${m}:${s}`;
          goals = item.goals;
          ownGoal = item.ownGoal;
          assistant = item.assistant;
          if (actionAddDel === 'goalDel') {
            goals--;
            Games.findOneAndUpdate({ _id: peremGameId, "gameStat._id": peremUserIdToGames }, {
              $set: { "gameStat.$.goals": goals, log: `${game[0].log} * ${stopwatchLog} - ${nikname} -1 гол` },
            }, { multi: true }, (e, data) => {
              bot.sendMessage(query.from.id, 'Хорошо. - 1 гол!');
              console.log('Записали goalDel');
              handlerGamesKeyboard(query.from.id, peremGameId);
            })
            return;
          } else if (actionAddDel === 'goalAdd') {
            goals++;
            Games.findOneAndUpdate({ _id: peremGameId, "gameStat._id": peremUserIdToGames }, {
              $set: { "gameStat.$.goals": goals, log: `${game[0].log} * ${stopwatchLog} - ${nikname} +1 гол` },
            }, { multi: true }, (e, data) => {
              bot.sendMessage(query.from.id, 'Хорошо. + 1 гол!');
              handlerGamesKeyboard(query.from.id, peremGameId);
              console.log('Записали goalAdd');
            })
            return;
          } else if (actionAddDel === 'ownGoalDel') {
            ownGoal--;
            Games.findOneAndUpdate({ _id: peremGameId, "gameStat._id": peremUserIdToGames }, {
              $set: { "gameStat.$.ownGoal": ownGoal, log: `${game[0].log} * ${stopwatchLog} - ${nikname} -1 автогол` },
            }, { multi: true }, (e, data) => {
              bot.sendMessage(query.from.id, 'Хорошо. - 1 автогол!');
              handlerGamesKeyboard(query.from.id, peremGameId);
              console.log('Записали ownGoalDel');
            })
            return;
          } else if (actionAddDel === 'ownGoalAdd') {
            ownGoal++;
            Games.findOneAndUpdate({ _id: peremGameId, "gameStat._id": peremUserIdToGames }, {
              $set: { "gameStat.$.ownGoal": ownGoal, log: `${game[0].log} * ${stopwatchLog} - ${nikname} +1 автогол` },
            }, { multi: true }, (e, data) => {
              bot.sendMessage(query.from.id, 'Хорошо. + 1 автогол!');
              handlerGamesKeyboard(query.from.id, peremGameId);
              console.log('Записали ownGoalAdd');
            })
            return;
          } else if (actionAddDel === 'assistantDel') {
            assistant--;
            Games.findOneAndUpdate({ _id: peremGameId, "gameStat._id": peremUserIdToGames }, {
              $set: { "gameStat.$.assistant": assistant, log: `${game[0].log} * ${stopwatchLog} - ${nikname} -1 голевой пас` },
            }, { multi: true }, (e, data) => {
              bot.sendMessage(query.from.id, 'Хорошо. - 1 пас!');
              handlerGamesKeyboard(query.from.id, peremGameId);
              console.log('Записали assistantDel');
            })
            return;
          } else if (actionAddDel === 'assistantAdd') {
            assistant++;
            Games.findOneAndUpdate({ _id: peremGameId, "gameStat._id": peremUserIdToGames }, {
              $set: { "gameStat.$.assistant": assistant, log: `${game[0].log} * ${stopwatchLog} - ${nikname} +1 голевой пас` },
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
              let date = game[0].gameDate.toISOString().split('T')[0];
              let text = `Поздравляю игра завершена!\n${date}\n\n${logGoals}\n${logAssistant}\n${logOwnGoal}`;
              let logtext = game[0].log.split('*');
              let logtextRes = `Логи матча ${date}\n`;
              logtext.forEach((item) => {
                logtextRes += `${item}\n`;
              })
              bot.sendMessage(query.from.id, text)
                .then(() => {
                  bot.sendMessage(query.from.id, logtextRes);
                })
              bot.sendMessage(config.groupFootballId, text)
                .then(() => {
                  bot.sendMessage(config.groupFootballId, logtextRes);
                })
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
      bot.sendMessage(queryFromId, 'Кто отличился?', {
        reply_markup: {
          inline_keyboard: keyboardPlayers
        }
      })
    })
  )
}
//показать список всех сссылок
bot.onText(/\/adminShowYouTubeURL_All/, (msg) => {
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
      listGames += `${game[key].numberId}) ${date}\nОбзор - ${game[key].urlYoutubeFull}\nПолное видео - ${game[key].urlYoutubeReview}\n\n`;
    }
    bot.sendMessage(msg.from.id, `Все ссылки на YouTube: \n\n${listGames}`, {
      disable_web_page_preview: true
    });
  })
    .sort({ numberId: 1 })
})
//показать список последних 10 ссылок на ютуб
bot.onText(/\/adminShowYouTubeURL_10/, (msg) => {
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
      listGames += `${game[key].numberId}) ${date}\nОбзор - ${game[key].urlYoutubeFull}\nПолное видео - ${game[key].urlYoutubeReview}\n\n`;
    }
    bot.sendMessage(msg.from.id, `Последние 10 ссылок на YouTube: \n\n${listGames}`, {
      disable_web_page_preview: true
    });
  })
    .sort({ numberId: 1 })
    .limit(10)
})

bot.onText(/\/adminAddYouTubeURL_Full (.+) (.+)/, (msg, [source, numberId, URl]) => {
  console.log('numberId', numberId);
  if (/^\d+$/.test(numberId) === false) {
    bot.sendMessage(msg.from.id, 'Ошибка. Введите целое число!');
    return;
  }
  if (config.adminRuslanId === msg.from.id || config.adminEgorId === msg.from.id) {
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
})
bot.onText(/\/adminAddYouTubeURL_Review (.+) (.+)/, (msg, [source, numberId, URl]) => {
  console.log('numberId', numberId);
  if (/^\d+$/.test(numberId) === false) {
    bot.sendMessage(msg.from.id, 'Ошибка. Введите целое число!');
    return;
  }
  if (config.adminRuslanId === msg.from.id || config.adminEgorId === msg.from.id) {
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
})
