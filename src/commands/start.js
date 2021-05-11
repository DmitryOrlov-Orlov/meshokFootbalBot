module.exports = {
  start(Users, bot, msg) {
    const a1 = 'Привет, я вижу что тебя еще нет в нашей базе данных! \nВам необходимо просмотреть список игроков и закрепиться за своим именем.\nВот список команд:\n';
    const a = `Отлично, тут вы сможете найти все доступные команды.\n`;
    const d = `/list_players - показать список игроков.\n`;
    const e = `/add_user - закрепиться за своим именем.\n`;
    const f = `/show_games_all - показать все игры которые есть в базе.\n`;
    const g = `/show_games_limit_10 - показать последние 10 игр.\n`;
    const h = `/show_game_information (N) - просмотреть информацию за конкретную игру (статистика/Timeline/ссылки на YouTube). Где N - это порядковый номер.\n`;
    const i = `/show_youtube_url_all - показать все ссылки на YouTube.\n`;
    const l = `/show_youtube_url_10 - показать последние 10 ссылок на YouTube.\n`;
    /* const m = `/personal_statistics - ваша статистика.\n`; */
    let mess = `${a}${d}${e}${f}${g}${h}${i}${l}`;
    Users.find({}, (err, users) => {
      if (users.length === 0) {
        bot.sendMessage(msg.from.id, `Извените, база пуста! \n\nОбратитесь к администратору, что бы он добавил ваше Имя за которым Вы сможете закрепится.`);
        return;
      }
      for (key in users) {
        if (users[key].userId === msg.from.id) {
          bot.sendMessage(msg.from.id, mess);
          return;
        }
      }
      bot.sendMessage(msg.from.id, `${a1}1) ${d}2) ${e}`);
    }).sort({ numberId: 1 })
  }
}