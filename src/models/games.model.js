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
  urlYoutubeFull: {
    type: String
  },
  urlYoutubeReview: {
    type: String
  },
  urlYoutubeLeftHalf: {
    type: String
  },
  urlYoutubeRightHalf: {
    type: String
  },
  gameOver: {
    type: Boolean
  },
  log: {
    type: String
  },
})

mongoose.model('games', Games)