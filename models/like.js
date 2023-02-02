'use strict'

const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Like extends Model {
    static associate(models) {
      Like.belongsTo(models.User, { foreignKey: 'userId' })
      Like.belongsTo(models.Question, {
        foreignKey: 'objectId',
        constraints: false,
        scope: { object: 'question' }
      })
      Like.belongsTo(models.Reply, {
        foreignKey: 'objectId',
        constraints: false,
        scope: { object: 'reply' }
      })
    }
  }
  Like.init(
    {
      userId: DataTypes.INTEGER,
      object: DataTypes.STRING,
      objectId: DataTypes.INTEGER,
      isSeed: DataTypes.BOOLEAN
    },
    {
      sequelize,
      modelName: 'Like',
      tableName: 'Likes'
    }
  )
  return Like
}
