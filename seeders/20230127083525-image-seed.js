'use strict'
const { Question, Reply } = require('../models')
const { IMAGES_IN_QUESTIONS, IMAGES_IN_REPLIES } = process.env

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const questionIdArr = await Question.findAll({
      raw: true,
      nest: true,
      where: {
        description: { [Sequelize.Op.like]: 'seed-question%' }
      },
      attributes: ['id']
    })
    const replyIdArr = await Reply.findAll({
      raw: true,
      nest: true,
      where: {
        comment: { [Sequelize.Op.like]: 'seed-reply%' }
      },
      attibutes: ['id']
    })
    await queryInterface.bulkInsert('Images', [
      ...Array.from({ length: Number(IMAGES_IN_QUESTIONS) }, (_, index) => ({
        object: 'question',
        objectId:
          questionIdArr[Math.floor(Math.random() * questionIdArr.length)].id,
        url: `https://loremflickr.com/320/240?lock=${index}`,
        isSeed: true,
        createdAt: new Date(),
        updatedAt: new Date()
      })),
      ...Array.from({ length: Number(IMAGES_IN_REPLIES) }, (_, index) => ({
        object: 'reply',
        objectId: replyIdArr[Math.floor(Math.random() * replyIdArr.length)].id,
        url: `https://loremflickr.com/320/240?lock=${
          index + Number(IMAGES_IN_QUESTIONS)
        }`,
        isSeed: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    ])
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Images', {
      isSeed: true
    })
  }
}
