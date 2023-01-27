'use strict'

const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Like extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Like.belongsTo(models.User, { foreignKey: 'userId' })
      if (this.object === 'question') {
        Like.belongsTo(Question, { foreignKey: 'object_id' })
      } else if (this.object === 'reply') {
        Like.belongsTo(Reply, { foreignKey: 'object_id' })
      }

      // define association here
    }
  }
  Like.init(
    {
      userId: DataTypes.INTEGER,
      object: DataTypes.STRING,
      objectId: DataTypes.INTEGER
    },
    {
      sequelize,
      modelName: 'Like',
      tableName: 'Likes'
    }
  )
  return Like
}
