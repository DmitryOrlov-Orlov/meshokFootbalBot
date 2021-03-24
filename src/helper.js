module.exports = {
  logStart() {
    console.log('Bot has been started ...')
  },
  getChatId(msg) {
    return msg.chat.id
  },
  debug(obj = {}) {
    return JSON.stringify(obj, null, 4)
  }
}