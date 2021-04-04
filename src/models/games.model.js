const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Games = new Schema({
  gameDate: {
    type: String,
    poll: {},
    gameStatistics: {
      goal: {
        type: Object
      },
      ownGoal: {
        type: Object
      },
      assistant: {
        type: Object
      }
    },
    gameOver: {
      type: Boolean
    }
  }
})

mongoose.model('games', Games)