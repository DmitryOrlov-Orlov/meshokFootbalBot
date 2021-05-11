module.exports = {
  personalStatistics(Users, bot, msg) {
    Users.find({ userId: msg.from.id }, (err, users) => {
      const games = `Количество матчей ${users[0].pollIdArr.length}.\n`;
      const goals = `Забили голов ${users[0].goals}.\n`;
      const assistant = `Отдали голевых пасов ${users[0].assistant}.\n`;
      const ownGoal = `Забили в свои ворота ${users[0].ownGoal}.\n`;
      const mess = `Ваша статистика за все время\n\n${games}${goals}${assistant}${ownGoal}`;
      bot.sendMessage(msg.from.id, mess);
    })
  }
}