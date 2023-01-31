'use strict'

const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Like extends Model {
    static associate(models) {
      Like.belongsTo(models.User, { foreignKey: 'userId' })
      if (this.object === 'question') {
        Like.belongsTo(Question, { foreignKey: 'object_id' })
      } else if (this.object === 'reply') {
        Like.belongsTo(Reply, { foreignKey: 'object_id' })
      }
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
