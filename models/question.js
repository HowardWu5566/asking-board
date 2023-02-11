'use strict'

const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Question extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Question.belongsTo(models.User, { foreignKey: 'userId' })
      Question.hasMany(models.Reply, { foreignKey: 'questionId' })

      // define association here
    }
  }
  Question.init(
    {
      userId: DataTypes.INTEGER,
      description: DataTypes.STRING,
      image: DataTypes.STRING,
      isAnonymous: DataTypes.BOOLEAN,
      grade: DataTypes.STRING,
      subject: DataTypes.STRING
    },
    {
      sequelize,
      modelName: 'Question',
      tableName: 'Questions'
    }
  )
  return Question
}
