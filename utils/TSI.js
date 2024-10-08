let EMA = require('technicalindicators').EMA
let Big = require("big.js")
function EMACalc(data, period) {
  return EMA.calculate({ period: period, values: data })
}


function TSI(dataList, firstPeriods = 25, secondPeriods = 13, signalPeriods) {
  let momList = [], absList = []

  dataList.forEach((closePriceItem, index) => {
    if (index > 1) {
      let priceChange = Big(dataList[index]).minus(dataList[index - 1]).valueOf() - 0
      let priceChangeABS = Math.abs(priceChange)
      momList.push(priceChange)
      absList.push(priceChangeABS)
    }
  })
  let up = EMACalc(EMACalc(momList, firstPeriods), secondPeriods)
  let down = EMACalc(EMACalc(absList, firstPeriods), secondPeriods)
  let TSILIST = up.map((item, index) => {
    return Big(up[index]).div(down[index]).times(100).valueOf() - 0
  })
  return TSILIST
}

module.exports = TSI