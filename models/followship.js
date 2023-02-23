'use strict'

const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Followship extends Model {
    static associate(models) {
      Followship.belongsTo(models.User, {
        foreignKey: 'followerId',
        as: 'followers'
      })
      Followship.belongsTo(models.User, {
        foreignKey: 'followingId',
        as: 'followings'
      })
    }
  }
  Followship.init(
    {
      followerId: DataTypes.INTEGER,
      followingId: DataTypes.INTEGER,
      isSeed: DataTypes.BOOLEAN
    },
    {
      sequelize,
      modelName: 'Followship',
      tableName: 'Followships'
    }
  )
  return Followship
}
