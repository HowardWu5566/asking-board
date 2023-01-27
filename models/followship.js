'use strict'

const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Followship extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Followship.belongsTo(models.User, {
        foreignKey: 'followerId',
        as: 'followings'
      })
      Followship.belongsTo(models.User, {
        foreignKey: 'followingId',
        as: 'followers'
      })
      // define association here
    }
  }
  Followship.init(
    {
      followerId: DataTypes.INTEGER,
      followingId: DataTypes.INTEGER
    },
    {
      sequelize,
      modelName: 'Followship',
      tableName: 'Followships'
    }
  )
  return Followship
}
