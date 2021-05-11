module.exports = {
  x(bot, msg, adminRuslanId, adminEgorId) {
    if (adminRuslanId === msg.from.id || adminEgorId === msg.from.id) {
      const ua = `Список команд доступных пользователю: \n`;
      const ub = `1) /add_user - пользователю нужно закрепиться за своим именем, это позволит нам вести статистику(предварительно нужно сообщить администратору, что бы тот добавил корректное имя в базу).\n`;
      const uc = `2) /list_players - показать список пользователей.\n`;
      const uf = `3) /show_games_all - показать все игры которые есть в базе.\n`;
      const ug = `4) /show_games_limit_10 - показать последние 10 игр.\n`;
      const uh = `5) /show_game_information (N) - просмотреть информацию за конкретную игру (статистика/Timeline/ссылки на YouTube). Где N - это порядковый номер.\n`;
      const ui = `6) /show_youtube_url_all - показать все ссылки на YouTube.\n`;
      const ul = `7) /show_youtube_url_10 - показать последние 10 ссылок на YouTube.\n`;
      /* const um = `8) /personal_statistics - ваша статистика.\n`; */

      const d = `Список команд доступных Администратору: \n`;
      const e = `1) /adminAddName - создать профиль.\n`;
      const f = `2) /adminDelPlayer - удалить профиль.\n`;
      const g = `3) /adminChangeNamePlayer - редактировать имя профиля.\n`;
      const h = `4) /adminCreatePoll (ЧЧ.ММ) (ДД.ММ.ГГГГ) (Х) - создать опрос. Где ЧЧ.ММ - это время, ДД.ММ.ГГГГ - это дата, Х - это количество игроков.\n`;
      const i = `5) /adminShowGamesList - показать игры доступные для создания счётчика.\n`;
      const l = `6) /adminCreateCounter (N) - создать счётчик статистики. Где N - это порядковый номер игры.\n`;
      const o = `7) /adminAddYouTubeURL_Review (N) (Link) - добавить ссылку на обзор матча. Где N - это порядковый номер. Link - это ссылка на обзор матча.\n`;
      const p = `8) /adminAddYouTubeURL_Full (N) (Link) - добавить ссылку на полный матч. Где N - это порядковый номер. Link - это ссылка на полный матч.\n`;
      const q = `9) /adminAddYouTubeURL_LeftHalf (N) (Link) - добавить ссылку на левую половину поля. Где N - это порядковый номер. Link - это ссылка на обзор матча.\n`;
      const r = `10) /adminAddYouTubeURL_RightHalf (N) (Link) - добавить ссылку на правую половину поля. Где N - это порядковый номер. Link - это ссылка на обзор матча.\n`;
      const t = `11) /adminShowIgnoreTheGame - показать список игроков игнорирущих голосования на футбол.\n`;
      const u = `12) /help - помощь.`;
      const commandUser = `${ua}${ub}${uc}${uf}${ug}${uh}${ui}${ul}`;
      const commandAdmin = `${d}${e}${f}${g}${h}${i}${l}${o}${p}${q}${r}${t}${u}`;
      const mess = `Что умеет данный бот:\n\n${commandUser}\n\n${commandAdmin}`
      bot.sendMessage(msg.from.id, mess);
    }
  }
}