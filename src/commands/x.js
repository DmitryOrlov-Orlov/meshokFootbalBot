module.exports = {
  x(bot, msg, adminRuslanId, adminEgorId) {
    if (adminRuslanId === msg.from.id || adminEgorId === msg.from.id) {
      const a = `Список команд доступных пользователю: \n`;
      const b = `1) /adduser - пользователю нужно закрепиться за своим именем, это позволит нам вести статистику(предварительно нужно сообщить администратору, что бы тот добавил корректное имя в базу).\n`;
      const c = `2) /listplayers - показать список пользователей.`;
      const d = `Список команд доступных Администратору: \n`;
      const e = `1) /adminAddName - создать профиль.\n`;
      const f = `2) /adminDelPlayer - удалить профиль.\n`;
      const g = `3) /adminChangeNamePlayer - редактировать имя профиля.\n`;
      const h = `4) /adminCreatePoll (ЧЧ.ММ) (ДД.ММ.ГГГГ) (Х) - сохдать опрос. Где ЧЧ.ММ - это время, ДД.ММ.ГГГГ - это дата, Х - это количество игроков.\n`;
      const i = `5) /adminShowGamesList - показать игры доступные для создания счётчика.\n`;
      const j = `6) /adminShowGamesAll - показать все игры которые есть в базе.\n`;
      const k = `7) /adminShowGamesLimit_10 - показать последние 10 игр.\n`;
      const l = `8) /adminCreateCounter (N) - создать счётчик статистики. Где N - это порядковый номер игры.\n`;
      const m = `9) /adminShowYouTubeURL_All - показать все ссылки на YouTube.\n`;
      const n = `10) /adminShowYouTubeURL_10 - показать последние 10 ссылок на YouTube.\n`;
      const o = `11) /adminAddYouTubeURL_Review (N) (Link) - добавить ссылку на обзор матча. Где N - это порядковый номер. Link - это ссылка на обзор матча.\n`;
      const p = `12) /adminAddYouTubeURL_Full (N) (Link) - добавить ссылку на полный матч. Где N - это порядковый номер. Link - это ссылка на полный матч.\n`;
      const r = `13) /adminAddYouTubeURL_LeftHalf (N) (Link) - добавить ссылку на левую половину поля. Где N - это порядковый номер. Link - это ссылка на обзор матча.\n`;
      const s = `14) /adminAddYouTubeURL_RightHalf (N) (Link) - добавить ссылку на правую половину поля. Где N - это порядковый номер. Link - это ссылка на обзор матча.\n`;
      const t = `15) /adminShowIgnoreTheGame - показать список игроков игнорирущих голосования на футбол.\n`;
      const q = `16) /help - помощь.`;
      const commandUser = `${a}${b}${c}`;
      const commandAdmin = `${d}${e}${f}${g}${h}${i}${j}${k}${l}${m}${n}${o}${p}${r}${s}${t}${q}`;
      const mess = `Что умеет данный бот:\n\n${commandUser}\n\n${commandAdmin}`
      bot.sendMessage(msg.from.id, mess);
    }
  }
}