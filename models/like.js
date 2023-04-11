'use strict'

const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Like extends Model {
    static associate(models) {
      Like.belongsTo(models.User, { foreignKey: 'userId' })
      Like.belongsTo(models.Question, {
        foreignKey: 'objectId'
      })
      Like.belongsTo(models.Reply, {
        foreignKey: 'objectId'
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

  // 定義 afterFind hook 修改查詢結果
  Like.addHook('afterFind', findResult => {
    if (!Array.isArray(findResult)) findResult = [findResult]
    for (const instance of findResult) {
      if (
        instance?.dataValues.object === 'question' &&
        instance?.Question !== undefined
      ) {
        delete instance.Reply
        delete instance.dataValues.Reply
      } else if (
        instance?.dataValues.object === 'reply' &&
        instance?.Reply !== undefined
      ) {
        delete instance.Question
        delete instance.dataValues.Question
      }
    }
  })

  return Like
}
