const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const config = require('./config');
const helper = require('./helper');

helper.logStart();
mongoose.Promise = global.Promise;
mongoose.connect(config.DB_URL)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('ERROR: ', err))
require('./models/users.model');
const Users = mongoose.model('users');

const bot = new TelegramBot(config.TOKEN, {
  polling: true
})

//скидываем все счетчики
let adminAddName = 0;
let adminDelPlayer = 0;
let adminChangeNamePlayer = 0;
bot.on('message', msg => {
  if (msg.text.substr(0, 1) === '/') {
    adminAddName = 0;
    adminDelPlayer = 0;
    adminChangeNamePlayer = 0;
  }
})

bot.onText(/\/help/, msg => {
  console.log('help');
  bot.sendMessage(msg.from.id, `Что умеет данный бот:\n\n1) /adminAddName - администратор может создать профиль. \n2) /adminDelPlayer - администратор может удалить профиль\n3) /listPlayers - показать список пользователей \n4) /addUser - пользователь может добавиться в базу\n5) /help - помощь`);
})

//Добавление НОВОГО ИМЕНИ в базу данных
bot.onText(/\/adminAddName/, msg => {
  adminAddName = 1;
  bot.sendMessage(msg.from.id, `Что бы добавить новый профиль, отправьте Имя + Фамилия.\n\n/listPlayers - показать список пользователей`);
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
    bot.sendMessage(msg.from.id, `Список пользователей в базе: \n${listPlayers}\n/adminAddName - добавить профиль\n/adminDelPlayer - удалить профиль\n/adminChangeNamePlayer - изменить имя у пользователя`);
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
})

bot.on('message', msg => {
  if (adminChangeNamePlayer === 1 && msg.text[0] !== '/') {
    let numberId = msg.text.match(/\d+/g);
    let newNikname = msg.text.replace(/[^a-zа-яё]/gi, '')
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
//Создаем новую сущность 


