'use strict'

const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Reply extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Reply.belongsTo(models.User, { foreignKey: 'userId' })
      Reply.belongsTo(models.Question, { foreignKey: 'questionId' })

      // define association here
    }
  }
  Reply.init(
    {
      userId: DataTypes.INTEGER,
      questionId: DataTypes.INTEGER,
      comment: DataTypes.STRING,
      image: DataTypes.STRING
    },
    {
      sequelize,
      modelName: 'Reply',
      tableName: 'Replies'
    }
  )
  return Reply
}
