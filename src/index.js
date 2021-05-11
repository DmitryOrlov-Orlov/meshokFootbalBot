const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const config = require('./config');
const helper = require('./helper');
const adminShowIgnoreTheGame = require('./commands/adminShowIgnoreTheGame');
const youTube = require('./commands/youTube');
const showGames = require('./commands/showGames');
const listplayers = require('./commands/listplayers');
const help = require('./commands/help');
const start = require('./commands/start');
const x = require('./commands/x');
const showGameInformation = require('./commands/showGameInformation');
const personalStatistics = require('./commands/personalStatistics');
const keyboardGamesActions = require('./keyboard-games-actions');

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
const botLOG = new TelegramBot(config.TOKEN_LOG, {
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
//Добавление НОВОГО ИМЕНИ в базу данных
bot.onText(/\/adminAddName/, msg => {
  if (config.adminRuslanId === msg.from.id || config.adminEgorId === msg.from.id) {
    adminAddName = 1;
    bot.sendMessage(msg.from.id, `Что бы добавить новый профиль, отправьте Имя Фамилия.\n\n/list_players - показать список пользователей`);
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
        voteСount: 0,
        pollIdArr: []
      }).save()
        .then((user) => {
          bot.sendMessage(msg.from.id, `В базу добавлен - ${user.nikname}.\n\n/adminAddName - добавить профиль\n/list_players - показать список пользователей`);
        })
      adminAddName = 0;
    }).sort({ numberId: -1 })
  }
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
        bot.sendMessage(msg.from.id, `Был удален: ${user.nikname} - ${user.firstName}\n/list_players - показать список пользователей.`);
        user.remove();
      }).then(() => {
        helper.handlerSortingUsers(Users);
      })
    })
    adminDelPlayer = 0;
  }
})
//Пользователь региструется в базе данных
let addUser = 0;
bot.onText(/\/add_user/, msg => {
  let listPlayers = '';
  Users.find({}, (err, users) => {
    if (users.length === 0) {
      addUser = 0;
      bot.sendMessage(msg.from.id, `Извените, база пуста! \n\nОбратитесь к администратору, что бы он добавил ваше Имя за которым Вы сможете закрепится.`);
      return;
    }
    addUser = 1;
    for (key in users) {
      if (users[key].userId === msg.from.id) {
        bot.sendMessage(msg.from.id, 'Извените, но вы уже сохранены в базе. Если хотите изменить имя, обратитесь к администратору.');
        return;
      }
      listPlayers += `${users[key].numberId}) ${users[key].nikname} - ${users[key].firstName}\n`;
    }
    bot.sendMessage(msg.from.id, `Отлично, теперь отправь порядковый номер своего имени.\n\nСписок пользователей в базе: \n${listPlayers}`);
  }).sort({ numberId: 1 })
})
bot.on('message', msg => {
  if (addUser === 1 && msg.text[0] !== '/') {
    let numberId = Number(msg.text);
    let flag = 0;
    if (numberId <= 0) {
      bot.sendMessage(msg.from.id, 'Ошибка. Число отрицательное либо 0! \nНажмите на /add_user\nИ введите порядковый номер.');
      return;
    }
    if (/^\d+$/.test(msg.text) === false) {
      addUser = 0;
      bot.sendMessage(msg.from.id, 'Ошибка. Надо ввести число! \nНажмите на /add_user\nИ введите число.');
      return;
    }
    Users.find({}, (err, users) => {
      if (numberId > users.length) {
        bot.sendMessage(msg.from.id, 'Ошибка. вы указали не верное число!\nНажмите на /add_user\nИ введите порядковый номер.');
      } else {
        for (key in users) {
          if (users[key].userId === msg.from.id) {
            flag = 1;
            bot.sendMessage(msg.from.id, 'Извените, но вы уже сохранены в базе. Если хотите изменить имя, обратитесь к администратору.');
            return;
          }
          if (users[key].logIn === true && users[key].numberId === numberId) {
            bot.sendMessage(msg.from.id, 'Извените, но за этим именем уже закрепился человек!\nНажмите на /add_user\nИ введите порядковый номер.');
            return;
          }
        }
        if (flag === 0) {
          console.log('будем регать');
          Users.findOneAndUpdate({ numberId: numberId }, {
            $set: { userId: msg.from.id, logIn: true, firstName: msg.from.first_name },
          }, { multi: true }, (e, data) => {
            bot.sendMessage(msg.from.id, 'Поздравляю. Вы добавлены в базу. Нажмите /start что бы увидеть список доступных команд.');
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
        helper.handlerSortingUsers(Users);
      })
  }
})
bot.on('message', msg => {
  if (adminChangeNamePlayer === 1 && msg.text[0] !== '/') {
    let numberId = msg.text.match(/\d+/g);
    let newNikname = msg.text.replace(/[^a-zA-ZА-Яа-яЁё]/gi, ' ');
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
  console.log('msg', msg.from.first_name);
  //обработать баг, если /createGame много параметров на экране!!!!!!!!!!!!!!!
  if (config.adminRuslanId === msg.from.id || config.adminEgorId === msg.from.id) {
    try {
      console.log('adminCreatePoll try');
      createPoll = 1;
      let year = Number(date.match(/\d+/g)[2]);
      let month = Number(date.match(/\d+/g)[1]) - 1;
      let day = Number(date.match(/\d+/g)[0]);
      let hour = Number(time.match(/\d+/g)[0]) + 5;
      let minutes = Number(time.match(/\d+/g)[1]);
      gameDate = new Date(year, month, day, hour, minutes);
      console.log('gameDate', gameDate.toISOString());
      gameMaxPlayers = maxPalyers;
      hour = hour - 5;
      String(day).length === 1 ? day = `0${day}` : day;
      String(month).length === 1 ? month = `0${month + 1}` : month + 1;
      String(hour).length === 1 ? hour = `0${hour}` : hour;
      String(minutes).length === 1 ? minutes = `0${minutes}` : minutes;
      bot.sendMessage(msg.chat.id, `Хорошо, игра состоится ${day}.${month}.${year} в ${hour}:${minutes}.\nВ команде ${maxPalyers} человек.\n\nТеперь напишите вводную информацию для команды (эта инфа пойдет в описание опроса).`);
    } catch (e) {
      console.log('adminCreatePoll catch');
      console.log('errorororo', e);
      bot.sendMessage(msg.from.id, "Ошибка. Введите верные параметры!");
    } finally {
      console.log('adminCreatePoll finally');
    }
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
          urlYoutubeFull: 'не добавлено',
          urlYoutubeReview: 'не добавлено',
          urlYoutubeLeftHalf: 'не добавлено',
          urlYoutubeRightHalf: 'не добавлено',
          gameOver: false,
          log: ''
        }).save()
        bot.sendMessage(msg.chat.id, 'Поздравляю, в чате должен появиться опрос. Проверь!')
      }).sort({ numberId: 1 })
        .then(() => {
          Games.find({}, (err, game) => {
            game.forEach((item, index) => {
              item.numberId = index + 1;
              Games(item).save();
            })
          }).sort({ gameDate: -1 });
          Users.find({}, (err, user) => {
            for (item in user) {
              let voteСount = user[item].voteСount + 1;
              Users.findOneAndUpdate({ _id: user[item].id }, {
                $set: {
                  voteСount: voteСount
                },
              }, { multi: true }, (e, data) => {
                console.log('handlerVotedCount + 1 у каждого игрока');
              })
            }
          })
        })
    });
  }
  createPoll = 0;
})
//в базу добавляется человек который проголосовал
bot.on('poll_answer', poll_answer => {
  Games.find({ pollId: poll_answer.poll_id }, (err, game) => {
    if (game.length === 1) {
      Users.findOneAndUpdate({ userId: poll_answer.user.id }, {
        $set: {
          voteСount: 0
        },
      }, { multi: true }, (e, data) => {
        console.log('handlerVotedCount 0 обнуляем');
      })
      Users.findOneAndUpdate({ userId: poll_answer.user.id }, {
        $push: {
          pollIdArr: poll_answer.poll_id
        },
      }, { multi: true }, (e, data) => {
        console.log('pollIdArr: poll_answer.poll_id');
      })
      return;
    }
  })
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
  console.log('1callback_query', query);
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
          let newDateHour = newDate.getHours();
          let newDateMinute = newDate.getMinutes();
          let newDateSecond = newDate.getSeconds();
          let gameDateHour = Number(game[0].gameDate.toISOString().split("T")[1].split(":")[0]);
          let gameDateMinute = game[0].gameDate.getMinutes();
          let gameDateSecond = game[0].gameDate.getSeconds();
          let ASec = (newDateHour * 60 * 60) + (newDateMinute * 60) + newDateSecond;
          let BSec = (gameDateHour * 60 * 60) + (gameDateMinute * 60) + gameDateSecond;
          let res = ASec - BSec;
          let h = Math.floor(res % (3600 * 24) / 3600);
          let m = Math.floor(res % 3600 / 60);
          let s = Math.floor(res % 60);
          String(h).length === 1 ? h = `0${h}` : h;
          String(m).length === 1 ? m = `0${m}` : m;
          String(s).length === 1 ? s = `0${s}` : s;
          let stopwatchLog = `${h}:${m}:${s}`;
          console.log('stopwatchLog', stopwatchLog);
          goals = item.goals;
          ownGoal = item.ownGoal;
          assistant = item.assistant;
          if (actionAddDel === 'goalDel') {
            goals--;
            Games.findOneAndUpdate({ _id: peremGameId, "gameStat._id": peremUserIdToGames }, {
              $set: { "gameStat.$.goals": goals, log: `${game[0].log} * ${stopwatchLog} - ${nikname} отменить гол` },
            }, { multi: true }, (e, data) => {
              bot.sendMessage(query.from.id, 'Хорошо. отменить гол!');
              console.log('Записали goalDel');
              handlerGamesKeyboard(query.from.id, peremGameId);
            })
            return;
          } else if (actionAddDel === 'goalAdd') {
            goals++;
            Games.findOneAndUpdate({ _id: peremGameId, "gameStat._id": peremUserIdToGames }, {
              $set: { "gameStat.$.goals": goals, log: `${game[0].log} * ${stopwatchLog} - ${nikname} забил гол` },
            }, { multi: true }, (e, data) => {
              bot.sendMessage(query.from.id, 'Хорошо. забил гол!');
              handlerGamesKeyboard(query.from.id, peremGameId);
              console.log('Записали goalAdd');
            })
            return;
          } else if (actionAddDel === 'ownGoalDel') {
            ownGoal--;
            Games.findOneAndUpdate({ _id: peremGameId, "gameStat._id": peremUserIdToGames }, {
              $set: { "gameStat.$.ownGoal": ownGoal, log: `${game[0].log} * ${stopwatchLog} - ${nikname} отменить автогол` },
            }, { multi: true }, (e, data) => {
              bot.sendMessage(query.from.id, 'Хорошо. отменить автогол!');
              handlerGamesKeyboard(query.from.id, peremGameId);
              console.log('Записали ownGoalDel');
            })
            return;
          } else if (actionAddDel === 'ownGoalAdd') {
            ownGoal++;
            Games.findOneAndUpdate({ _id: peremGameId, "gameStat._id": peremUserIdToGames }, {
              $set: { "gameStat.$.ownGoal": ownGoal, log: `${game[0].log} * ${stopwatchLog} - ${nikname} автогол` },
            }, { multi: true }, (e, data) => {
              bot.sendMessage(query.from.id, 'Хорошо. автогол!');
              handlerGamesKeyboard(query.from.id, peremGameId);
              console.log('Записали ownGoalAdd');
            })
            return;
          } else if (actionAddDel === 'assistantDel') {
            assistant--;
            Games.findOneAndUpdate({ _id: peremGameId, "gameStat._id": peremUserIdToGames }, {
              $set: { "gameStat.$.assistant": assistant, log: `${game[0].log} * ${stopwatchLog} - ${nikname} отменить голевой пас` },
            }, { multi: true }, (e, data) => {
              bot.sendMessage(query.from.id, 'Хорошо. отменить голевой пас!');
              handlerGamesKeyboard(query.from.id, peremGameId);
              console.log('Записали assistantDel');
            })
            return;
          } else if (actionAddDel === 'assistantAdd') {
            assistant++;
            Games.findOneAndUpdate({ _id: peremGameId, "gameStat._id": peremUserIdToGames }, {
              $set: { "gameStat.$.assistant": assistant, log: `${game[0].log} * ${stopwatchLog} - ${nikname} отдал голевой пас` },
            }, { multi: true }, (e, data) => {
              bot.sendMessage(query.from.id, 'Хорошо. отдал голевой пас!');
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
            }).then((data) => {
              let date = game[0].gameDate.toISOString().split('T')[0];
              let text = `Поздравляю игра завершена!\n${date}\n\n${logGoals}\n${logAssistant}\n${logOwnGoal}`;
              let logtext = game[0].log.split('*');
              let logtextRes = `Timeline матча ${date}\n`;
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
bot.onText(/\/x/, msg => {
  x.x(bot, msg, config.adminRuslanId, config.adminEgorId);
})
bot.onText(/\/start/, msg => {
  start.start(Users, bot, msg);
})
bot.onText(/\/help/, msg => {
  help.help(bot, msg);
})
bot.onText(/\/list_players/, msg => {
  listplayers.listplayers(Users, bot, msg, config.adminRuslanId, config.adminEgorId);
})
bot.onText(/\/adminShowGamesList/, msg => {
  showGames.adminShowGamesList(Games, bot, msg, config.adminRuslanId, config.adminEgorId);
})
bot.onText(/\/show_games_all/, msg => {
  showGames.showGamesAll(Games, bot, msg);
})
bot.onText(/\/show_games_limit_10/, msg => {
  showGames.showGamesLimit_10(Games, bot, msg);
})
bot.onText(/\/show_youtube_url_all/, (msg) => {
  youTube.showYouTubeURL_All(Games, bot, msg);
})
bot.onText(/\/show_youtube_url_10/, (msg) => {
  youTube.showYouTubeURL_10(Games, bot, msg);
})
bot.onText(/\/show_game_information (.+)/, (msg, [source, numberId]) => {
  showGameInformation.showGameInformation(Games, bot, msg, numberId);
})
bot.onText(/\/adminAddYouTubeURL_Review (.+) (.+)/, (msg, [source, numberId, URl]) => {
  youTube.adminAddYouTubeURL_Review(
    Games,
    bot,
    msg,
    config.adminRuslanId,
    config.adminEgorId,
    numberId,
    URl
  );
})
bot.onText(/\/adminAddYouTubeURL_Full (.+) (.+)/, (msg, [source, numberId, URl]) => {
  youTube.adminAddYouTubeURL_Full(
    Games,
    bot,
    msg,
    config.adminRuslanId,
    config.adminEgorId,
    numberId,
    URl
  );
})
bot.onText(/\/adminAddYouTubeURL_LeftHalf (.+) (.+)/, (msg, [source, numberId, URl]) => {
  youTube.adminAddYouTubeURL_LeftHalf(
    Games,
    bot,
    msg,
    config.adminRuslanId,
    config.adminEgorId,
    numberId,
    URl
  );
})
bot.onText(/\/adminAddYouTubeURL_RightHalf (.+) (.+)/, (msg, [source, numberId, URl]) => {
  youTube.adminAddYouTubeURL_RightHalf(
    Games,
    bot,
    msg,
    config.adminRuslanId,
    config.adminEgorId,
    numberId,
    URl
  );
})
bot.onText(/\/adminShowIgnoreTheGame/, msg => {
  adminShowIgnoreTheGame.adminShowIgnoreTheGame(Users, bot, msg);
})
bot.onText(/\/personal_statistics/, msg => {
  personalStatistics.personalStatistics(Users, bot, msg);
})
bot.on('message', msg => {
  helper.botLOG(botLOG, msg, config.adminRuslanId);
})
