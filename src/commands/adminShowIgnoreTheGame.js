module.exports = {
  adminShowIgnoreTheGame(Users, bot, msg) {
    let mess = 'Список игроков игнорирующих голосования на футбол:\n';
    Users.find({}, (err, user) => {
      console.log('user', user.length === 0);
      if (user.length === 0) {
        return;
      }
      for (item in user) {
        let userName = user[item].nikname;
        let voteСount = user[item].voteСount;
        if (voteСount > 0) {
          mess += `${userName} = ${voteСount}\n`
        }
      }
    }).then(() => {
      bot.sendMessage(msg.from.id, mess);
    })
  }
}