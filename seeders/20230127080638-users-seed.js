'use strict'

const bcrypt = require('bcryptjs')
const {
  TEACHERS_AMOUNT,
  STUDENTS_AMOUNT
} = require('../helpers/seeders-amount')
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
        introduction: '我是網站管理員',
        isLocalAccount: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      ...Array.from({ length: TEACHERS_AMOUNT }, (_, index) => ({
        name: `seed-teacher${index + 1}`,
        email: `teacher${index + 1}@example.com`,
        password: bcrypt.hashSync(DEFAULT_PASSWORD, bcrypt.genSaltSync(10)),
        role: '老師',
        avatar: `https://loremflickr.com/320/240/man,woman/?lock=${index + 1}`,
        introduction: '我是個老師，是種子資料',
        isLocalAccount: true,
        createdAt: new Date(),
        updatedAt: new Date()
      })),
      ...Array.from({ length: STUDENTS_AMOUNT }, (_, index) => ({
        name: `seed-student${index + 1}`,
        email: `student${index + 1}@example.com`,
        password: bcrypt.hashSync(DEFAULT_PASSWORD, bcrypt.genSaltSync(10)),
        role: '學生',
        avatar: `https://loremflickr.com/320/240/man,woman/?lock=${
          index + TEACHERS_AMOUNT + 1
        }`,
        introduction: '我是個學生，是種子資料',
        isLocalAccount: true,
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
          { length: TEACHERS_AMOUNT },
          (_, index) => `seed-teacher${index + 1}`
        ),
        ...Array.from(
          { length: STUDENTS_AMOUNT },
          (_, index) => `seed-student${index + 1}`
        )
      ]
    })
  }
}
