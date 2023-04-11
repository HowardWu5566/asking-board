'use strict'

const faker = require('faker')
const { User, Question } = require('../models')
const { TEACHER_REPLIES_PER_QUESTION, MAX_STUDENT_REPLIES_AMOUNT } = process.env

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const replies = []
    const teacherIdArr = await User.findAll({
      raw: true,
      nest: true,
      where: {
        role: '老師',
        name: {
          [Sequelize.Op.like]: 'seed-teacher%'
        }
      },
      attributes: ['id']
    })
    const studentIdArr = await User.findAll({
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
        ...Array.from({ length: Number(TEACHER_REPLIES_PER_QUESTION) }, () => ({
          UserId:
            teacherIdArr[Math.floor(Math.random() * teacherIdArr.length)].id,
          QuestionId: question.id,
          comment: 'seed-reply:' + faker.lorem.sentences(2),
          createdAt: new Date(),
          updatedAt: new Date()
        }))
      )
      replies.push(
        ...Array.from(
          {
            length: Math.floor(
              Math.random() * Number(MAX_STUDENT_REPLIES_AMOUNT)
            )
          },
          () => ({
            UserId:
              studentIdArr[Math.floor(Math.random() * studentIdArr.length)].id,
            QuestionId: question.id,
            comment: 'seed-reply:' + faker.lorem.sentences(2),
            createdAt: new Date(),
            updatedAt: new Date()
          })
        )
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
