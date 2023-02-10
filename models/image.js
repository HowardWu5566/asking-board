'use strict'

const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Image extends Model {
    static associate(models) {
      Image.belongsTo(models.Question, {
        foreignKey: 'objectId',
        constraints: false,
        scope: { object: 'question' }
      })
      Image.belongsTo(models.Reply, {
        foreignKey: 'objectId',
        constraints: false,
        scope: { object: 'reply' }
      })
    }
  }
  Image.init(
    {
      object: DataTypes.STRING,
      objectId: DataTypes.INTEGER,
      url: DataTypes.STRING,
      isSeed: DataTypes.BOOLEAN
    },
    {
      sequelize,
      modelName: 'Image',
      tableName: 'Images'
    }
  )
  return Image
}
