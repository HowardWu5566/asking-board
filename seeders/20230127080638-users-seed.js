'use strict'

const bcrypt = require('bcryptjs')
const faker = require('faker')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const DEFAULT_PASSWORD = 'password'
    await queryInterface.bulkInsert('Users', [
      {
        name: 'root',
        email: 'root@example.com',
        password: bcrypt.hashSync(DEFAULT_PASSWORD, bcrypt.genSaltSync(10)),
        role: 'admin',
        avatar: 'https://loremflickr.com/320/240/man,woman/?lock=0',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      ...Array.from({ length: 10 }, (_, index) => ({
        name: `seed-user${index + 1}`,
        email: `user${index + 1}@example.com`,
        password: bcrypt.hashSync(DEFAULT_PASSWORD, bcrypt.genSaltSync(10)),
        role: 'user',
        avatar: `https://loremflickr.com/320/240/man,woman/?lock=${index + 1}`,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    ])
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', {
      name: [
        'root',
        ...Array.from(
          { length: SEED_USERS_AMOUNT },
          (_, i) => `seed-user${i + 1}`
        )
      ]
    })
  }
}
