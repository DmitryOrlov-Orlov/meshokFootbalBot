module.exports = [
  [
    {
      text: "-1 гол",
      callback_data: 'action#goalDel'
    },
    {
      text: "+1 гол",
      callback_data: 'action#goalAdd'
    }
  ],
  [
    {
      text: "-1 голевой пас",
      callback_data: 'action#assistantDel'
    },
    {
      text: "+1 голевой пас",
      callback_data: 'action#assistantAdd'
    }
  ],
  [
    {
      text: "-1 автогол",
      callback_data: 'action#ownGoalDel'
    },
    {
      text: "+1 автогол",
      callback_data: 'action#ownGoalAdd'
    }
  ],
  [
    {
      text: "Отмена",
      callback_data: 'action#cancel'
    }
  ]
]