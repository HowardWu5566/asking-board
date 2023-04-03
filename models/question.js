'use strict'

const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Question extends Model {
    static associate(models) {
      Question.belongsTo(models.User, { foreignKey: 'userId' })
      Question.hasMany(models.Reply, { foreignKey: 'questionId' })
      Question.hasMany(models.Like, {
        foreignKey: 'objectId',
        constraints: false,
        scope: { object: 'question' }
      })
    }
  }
  Question.init(
    {
      userId: DataTypes.INTEGER,
      title: DataTypes.STRING,
      description: DataTypes.STRING,
      isAnonymous: DataTypes.BOOLEAN,
      grade: DataTypes.STRING,
      subject: DataTypes.STRING,
      image: DataTypes.STRING
    },
    {
      sequelize,
      modelName: 'Question',
      tableName: 'Questions'
    }
  )
  return Question
}
