'use strict'

const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Reply extends Model {
    static associate(models) {
      Reply.belongsTo(models.User, { foreignKey: 'userId' })
      Reply.belongsTo(models.Question, { foreignKey: 'questionId' })
      Reply.hasMany(models.Image, {
        foreignKey: 'objectId',
        constraints: false,
        scope: { object: 'reply' }
      })
      Reply.hasMany(models.Like, {
        foreignKey: 'objectId',
        constraints: false,
        scope: { object: 'reply' }
      })
    }
  }
  Reply.init(
    {
      userId: DataTypes.INTEGER,
      questionId: DataTypes.INTEGER,
      comment: DataTypes.STRING
    },
    {
      sequelize,
      modelName: 'Reply',
      tableName: 'Replies'
    }
  )
  return Reply
}
