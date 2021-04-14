const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const config = require('./config');
const helper = require('./helper');

helper.logStart();
mongoose.Promise = global.Promise;
mongoose.connect(config.DB_URL)
  .then(() => console.log('MongoDB connected - users.model'))
  .catch((err) => console.log('ERROR: ', err))
require('./models/users.model');
mongoose.connect(config.DB_URL)
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
  bot.sendMessage(msg.from.id, `Что умеет данный бот:\n\nСписок команд доступных пользователю:\n1) /addUser - пользователю нужно закрепиться за своим именем, это позволит нам вести статистику (предварительно нужно сообщить администратору, что бы тот добавил корректное имя в базу).\n2) /listPlayers - показать список пользователей.\n\nСписок команд доступных Администратору: \n1) /adminAddName - создать профиль. \n2) /adminDelPlayer - удалить профиль.\n3) /adminChangeNamePlayer - редактировать имя профиля.\n4) /adminCreatePoll ЧЧ.ММ ДД.ММ.ГГГГ Х\nгде: Х - это количество игроков\n\n5) /help - помощь.`);
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
      let perem = 10;
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
      Users.findOne({ numberId: numberId }, (error, user) => {
        user.userId = msg.from.id;
        user.logIn = true;
        user.firstName = msg.from.first_name
        Users(user).save();
        bot.sendMessage(msg.from.id, 'Поздравляю. Вы добавлены в базу.');
        return;
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
    let month = Number(date.match(/\d+/g)[1]);
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
      Games({
        gameDate: gameDate,
        pollId: dataPoll.poll.id,
        pollDescription: msg.text,
        gameMaxPlayers: gameMaxPlayers,
        gameStat: [],
        gameOver: false
      }).save();
      bot.sendMessage(msg.chat.id, 'Поздравляю, в чате должен появиться опрос. Проверь!\nЗа два часа до начала игры, голосование закроется.')
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


//создаем счетчик