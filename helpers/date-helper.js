const dayjs = require('dayjs')
require('dayjs/locale/zh-tw')
dayjs.locale('zh-tw') // 繁體中文
const relativeTime = require('dayjs/plugin/relativeTime')
dayjs.extend(relativeTime) // 相對時間

module.exports = {
  relativeTime: a => {
    if (dayjs().diff(dayjs(a), 'day') >= 7) {
      return dayjs(a).format('YYYY年M月D日')
    } else {
      return dayjs(a).fromNow()
    }
  }
}
