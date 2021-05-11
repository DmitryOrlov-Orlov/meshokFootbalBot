const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Users = new Schema({
  userId: {
    type: Number
  },
  numberId: {
    type: Number
  },
  firstName: {
    type: String
  },
  logIn: {
    type: Boolean
  },
  nikname: {
    type: String
  },
  games: {
    type: Number
  },
  goals: {
    type: Number
  },
  assistant: {
    type: Number
  },
  ownGoal: {
    type: Number
  },
  voteСount: {
    type: Number
  },
  pollIdArr: {
    type: Array
  }
})

mongoose.model('users', Users)