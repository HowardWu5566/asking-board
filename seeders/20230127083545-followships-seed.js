'use strict'

const { User } = require('../models')
const { FOLLOWSHIP_AMOUNT } = process.env

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const followships = []
    const userIdArr = await User.findAll({
      raw: true,
      nest: true,
      where: Sequelize.or(
        { name: { [Sequelize.Op.like]: 'seed-student%' } },
        { name: { [Sequelize.Op.like]: 'seed-teacher%' } }
      ),
      attrivutes: ['id']
    })
    do {
      let followerId
      let followingId
      do {
        followerId = userIdArr[Math.floor(Math.random() * userIdArr.length)].id
        followingId = userIdArr[Math.floor(Math.random() * userIdArr.length)].id
      } while (
        followerId === followingId ||
        followships.join('、').includes(`${followerId},${followingId}`)
      )
      followships.push([followerId, followingId])
    } while (followships.length < Number(FOLLOWSHIP_AMOUNT))

    await queryInterface.bulkInsert(
      'Followships',
      Array.from({ length: Number(FOLLOWSHIP_AMOUNT) }, (_, index) => ({
        followerId: followships[index][0],
        followingId: followships[index][1],
        isSeed: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    )
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Followships', {
      isSeed: true
    })
  }
}
