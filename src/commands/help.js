module.exports = {
  help(bot, msg) {
    const a = `Что умеет данный бот:\n\nСписок команд доступных пользователю:\n`;
    const b = `1) /add_user - пользователю нужно закрепиться за своим именем, это позволит нам вести статистику (предварительно нужно сообщить администратору, что бы тот добавил корректное имя в базу).\n`;
    const c = `2) /listplayers - показать список пользователей.\n`;
    const d = `3) /showGamesAll - показать все игры которые есть в базе.\n`;
    const e = `4) /showGamesLimit_10 - показать последние 10 игр.\n`;
    const f = `5) /showGameStatistic (N) - просмотреть статистику за конкретную игру. Где N - это порядковый номер.\n`;
    const g = `6) /showYouTubeURL_All - показать все ссылки на YouTube.\n`;
    const h = `7) /showYouTubeURL_10 - показать последние 10 ссылок на YouTube.\n`;
    const i = `8) /help - помощь.`;
    let mess = `${a}${b}${c}${d}${e}${f}${g}${h}${i}`;
    bot.sendMessage(msg.from.id, mess);
  }
}