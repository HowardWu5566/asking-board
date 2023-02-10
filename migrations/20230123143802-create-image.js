'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Images', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      object: {
        allowNull: false,
        type: Sequelize.STRING
      },
      objectId: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      url: {
        allowNull: false,
        type: Sequelize.STRING
      },
      isSeed: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Images')
  }
}
