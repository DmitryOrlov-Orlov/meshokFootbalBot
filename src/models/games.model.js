const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Games = new Schema({
  gameDate: {
    type: Date
  },
  numberId: {
    type: Number
  },
  pollId: {
    type: String
  },
  pollDescription: {
    type: String
  },
  gameMaxPlayers: {
    type: Number
  },
  gameStat: [{
    userId: {
      type: Number
    },
    firstName: {
      type: String
    },
    nikname: {
      type: String
    },
    goals: {
      type: Number
    },
    assistant: {
      type: Number
    },
    ownGoal: {
      type: Number
    }
  }],
  urlYoutube: {
    type: String
  },
  gameOver: {
    type: Boolean
  }
})

mongoose.model('games', Games)