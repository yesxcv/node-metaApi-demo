const moment = require('moment-timezone')
const commonMoment = require('moment')
let timeZone = `Etc/GMT`

// (UTC+02:00) 开罗	Africa/Cairo
// (UTC+00:00) 协调世界时	Etc/GMT
function inTradeTime({ tradeSessions, path, side }) {
  let dateArr = {
    0: 'SUNDAY',
    1: 'MONDAY',
    2: 'TUESDAY',
    3: 'WEDNESDAY',
    4: 'THURSDAY',
    5: 'FRIDAY',
    6: 'SATURDAY',
  }
  if (!tradeSessions) return console.error(`loss tradeSessions`)
  let dateStr = moment().tz(timeZone).format(`YYYY-MM-DD`)
  let day = moment().tz(timeZone).day()
  if (!tradeSessions[dateArr[day]]) return false
  if (path.startsWith(`Stock`)) {
    //股票类，根据开仓还是平仓判断当前时间是否在交易时间内
    return tradeSessions[dateArr[day]].some((item) => {
      return commonMoment(
        moment().tz(timeZone).format('YYYY-MM-DD HH:mm:ss')
      ).isBetween(
        side == 'open'
          ? `${dateStr} 13:40:00`
          : `${dateStr} ${item.from.split('.')[0]}`,
        `${dateStr} ${item.to.split('.')[0]}`
      )
    })
  } else if (path.startsWith(`Forex`)) {
    //外汇类

    if ([0, 1, 2, 3, 4, 5].includes(day)) {
      return tradeSessions[dateArr[day]].some((item) => {
        return commonMoment(
          moment().tz(timeZone).format('YYYY-MM-DD HH:mm:ss')
        ).isBetween(
          `${dateStr} ${item.from.split('.')[0]}`,
          `${dateStr} ${item.to.split('.')[0]}`
        )
      })
    } else {
      return false
    }
  } else if (path.startsWith(`Crypto`)) {
    return true
  } else {
    console.log(`未处理的交易品种`)
    return false
  }
}

module.exports = {
  inTradeTime,
}
