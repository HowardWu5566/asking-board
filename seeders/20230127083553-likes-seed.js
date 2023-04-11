'use strict'
const { User, Question, Reply } = require('../models')
const { LIKE_QUESTION_AMOUNT, LIKE_REPLY_AMOUNT } = process.env

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const userIdArr = await User.findAll({
      raw: true,
      nest: true,
      where: Sequelize.or(
        { name: { [Sequelize.Op.like]: 'seed-student%' } },
        { name: { [Sequelize.Op.like]: 'seed-teacher%' } }
      ),
      attributes: ['id']
    })
    const questionIdArr = await Question.findAll({
      raw: true,
      nest: true,
      where: {
        description: {
          [Sequelize.Op.like]: 'seed-question%'
        }
      },
      attributes: ['id']
    })
    const replyIdArr = await Reply.findAll({
      raw: true,
      nest: true,
      where: {
        comment: {
          [Sequelize.Op.like]: 'seed-reply%'
        }
      },
      attibutes: ['id']
    })
    const likes = []
    do {
      let userId
      let questionId
      do {
        userId = userIdArr[Math.floor(Math.random() * userIdArr.length)].id
        questionId =
          questionIdArr[Math.floor(Math.random() * questionIdArr.length)].id
      } while (likes.join('-').includes(`${userId},question,${questionId}`))
      likes.push([userId, 'question', questionId])
    } while (likes.length < Number(LIKE_QUESTION_AMOUNT))

    do {
      let userId
      let replyId
      do {
        userId = userIdArr[Math.floor(Math.random() * userIdArr.length)].id
        replyId = replyIdArr[Math.floor(Math.random() * replyIdArr.length)].id
      } while (likes.join('-').includes(`${userId},reply,${replyId}`))
      likes.push([userId, 'reply', replyId])
    } while (
      likes.length <
      Number(LIKE_QUESTION_AMOUNT) + Number(LIKE_REPLY_AMOUNT)
    )
    await queryInterface.bulkInsert(
      'Likes',
      Array.from(
        {
          length: Number(LIKE_QUESTION_AMOUNT) + Number(LIKE_REPLY_AMOUNT)
        },
        (_, index) => ({
          userId: likes[index][0],
          object: likes[index][1],
          objectId: likes[index][2],
          isSeed: true,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      )
    )
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Likes', {
      isSeed: true
    })
  }
}
