module.exports = {
  listplayers(Users, bot, msg, adminRuslanId, adminEgorId) {
    Users.find({}, (err, users) => {
      if (users.length === 0 && adminEgorId === Number(msg.from.id) || adminRuslanId === Number(msg.from.id)) {
        if (users.length === 0) {
          console.log(msg);
          bot.sendMessage(msg.from.id, `База данных пуста! \n\n/adminAddName - добавить профиль`);
          return;
        }
      }
      if (users.length === 0) {
        bot.sendMessage(msg.from.id, `База данных пуста! Обратитесь к администратору.`);
        return;
      }
      let listPlayers = '';
      for (key in users) {
        listPlayers += `${users[key].numberId}) ${users[key].nikname} - ${users[key].firstName}\n`;
      }
      bot.sendMessage(msg.from.id, `Список игроков в базе: \n${listPlayers}`)
        .then(() => {
          if (adminRuslanId === Number(msg.from.id) || adminEgorId === Number(msg.from.id)) {
            bot.sendMessage(msg.from.id, `/adminAddName - добавить профиль\n/adminDelPlayer - удалить профиль\n/adminChangeNamePlayer - изменить имя у пользователя`);
          } else {
            bot.sendMessage(msg.from.id, `/add_user - закрепиться за своим именем.`);
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
          console.log('handlerSortingUsers');
        })
      })
  }
}