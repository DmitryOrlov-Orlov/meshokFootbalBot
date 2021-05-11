module.exports = {
  logStart() {
    console.log('Bot has been started ...')
  },
  getChatId(msg) {
    return msg.chat.id
  },
  debug(obj = {}) {
    return JSON.stringify(obj, null, 4)
  },
  botLOG(botLOG, msg, adminRuslanId) {
    const first_name = msg.from.first_name;
    const username = msg.from.username;
    const last_name = msg.from.last_name;
    const msgtext = msg.text;
    const test = ` ${last_name} ${first_name} ${username}\n${msgtext}`;
    botLOG.sendMessage(adminRuslanId, test);
  },
  //можно будет удалить
  handlerVotedCount(Users) {
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
  },
  //можно будет удалить
  handlerSortingUsers(Users) {
    Users.find({}, (err, user) => {
      user.forEach((item, index) => {
        item.numberId = index + 1;
        Users(item).save();
      })
      console.log('handlerSortingUsers');
    })
  }
}