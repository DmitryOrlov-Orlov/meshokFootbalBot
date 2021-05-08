module.exports = [
  [
    {
      text: "отменить гол",
      callback_data: 'action#goalDel'
    },
    {
      text: "забил гол",
      callback_data: 'action#goalAdd'
    }
  ],
  [
    {
      text: "отменить голевой пас",
      callback_data: 'action#assistantDel'
    },
    {
      text: "отдал голевой пас",
      callback_data: 'action#assistantAdd'
    }
  ],
  [
    {
      text: "отменить автогол",
      callback_data: 'action#ownGoalDel'
    },
    {
      text: "забил автогол",
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