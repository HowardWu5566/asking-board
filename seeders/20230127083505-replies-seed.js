'use strict'

const faker = require('faker')
const { REPLIES_PER_QUESTION } = require('../helpers/seeders-amount')
const { User, Question } = require('../models')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const replies = []
    const userIdArr = await User.findAll({
      raw: true,
      nest: true,
      where: {
        role: 'student',
        name: {
          [Sequelize.Op.like]: 'seed-student%'
        }
      },
      attributes: ['id']
    })
    const questionIdArr = await Question.findAll({
      raw: true,
      nest: true,
      where: {
        description: {
          [Sequelize.Op.like]: 'seed-question:%'
        }
      },
      attributes: ['id']
    })
    questionIdArr.forEach((question, index) => {
      replies.push(
        ...Array.from({ length: REPLIES_PER_QUESTION }, () => ({
          UserId: userIdArr[Math.floor(Math.random() * userIdArr.length)].id,
          QuestionId: question.id,
          comment: 'seed-reply:' + faker.lorem.sentences(2),
          createdAt: new Date(),
          updatedAt: new Date()
        }))
      )
    })
    await queryInterface.bulkInsert('Replies', replies)
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Replies', {
      comment: {
        [Sequelize.Op.like]: 'seed-reply:%'
      }
    })
  }
}
