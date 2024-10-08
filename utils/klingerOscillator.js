let highIndex = 2
let lowIndex = 3
let closeIndex = 4
let VolumeIndex = 5
let Big = require('big.js')
let EMA = require('technicalindicators').EMA

function KVO (orginKLine, shortPeriod = 34, longPeriod = 55, TrigLen = 13) {
  let gethlc3 = kline => {
    return new Big(kline[highIndex])
      .plus(kline[lowIndex])
      .plus(kline[closeIndex])
      .div(3)
      .valueOf()
  }
  let xTrend = orginKLine.map((klineItem, index) => {
    if (index < 1) return 0
    if (gethlc3(orginKLine[index]) > gethlc3(orginKLine[index - 1])) {
      return (
        Big(`100`)
          .times(orginKLine[index][VolumeIndex])
          .valueOf() - 0
      )
    } else {
      return (
        Big(`-100`)
          .times(orginKLine[index][VolumeIndex])
          .valueOf() - 0
      )
    }
  })
  //使用后100条数据处理

  let xFast = EMA.calculate({ period: shortPeriod, values: xTrend }).slice(-100)
  let xSlow = EMA.calculate({ period: longPeriod, values: xTrend }).slice(-100)
  let xKVO = xFast.map((fastItem, index) => {
    return (
      Big(fastItem)
        .minus(xSlow[index])
        .valueOf() - 0
    )
  })
  let xTrigger = EMA.calculate({ period: TrigLen, values: xKVO })
  let res = {
    xKVO: xKVO.slice(-1)[0],
    KVOdiff:
      Big(xTrigger.slice(-1)[0])
        .minus(xKVO.slice(-1)[0])
        .valueOf() - 0
  }
  return res
}

module.exports = KVO
