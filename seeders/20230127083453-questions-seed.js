'use strict'

const faker = require('faker')
const { User } = require('../models')
const { STUDENTS_AMOUNT, QUESTIONS_PER_STUDENT } = process.env

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const grade = ['國中一年級', '國中二年級', '國中三年級', '其他']
    const subject = [
      '國文',
      '英文',
      '數學',
      '生物',
      '理化',
      '地科',
      '歷史',
      '地理',
      '公民'
    ]
    const userIdArr = await User.findAll({
      raw: true,
      nest: true,
      where: {
        role: '學生',
        name: {
          [Sequelize.Op.like]: 'seed-student%'
        }
      },
      attributes: ['id']
    })
    await queryInterface.bulkInsert(
      'Questions',
      Array.from(
        {
          length: Number(QUESTIONS_PER_STUDENT) * Number(STUDENTS_AMOUNT)
        },
        (_, index) => ({
          UserId:
            userIdArr[Math.floor(index / Number(QUESTIONS_PER_STUDENT))].id,
          title: 'seed-question ' + (index + 1),
          description: 'seed-question: ' + faker.lorem.sentences(2),
          isAnonymous: Math.random() > 0.8,
          grade: grade[Math.floor(Math.random() * grade.length)],
          subject: subject[Math.floor(Math.random() * subject.length)],
          createdAt: new Date(),
          updatedAt: new Date()
        })
      )
    )
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Questions', {
      description: {
        [Sequelize.Op.like]: 'seed-question:%'
      }
    })
  }
}
