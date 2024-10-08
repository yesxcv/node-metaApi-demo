/**
 * 计算当前K线开仓时开仓方向上的收盘价占dema一方的比例
 */

let EMA = require('technicalindicators').EMA
let Big = require("big.js")

function DEMA(closeList, period = 432) {
  let input2e1 = { period: period, values: closeList }
  let E1 = EMA.calculate(input2e1)
  let input2e2 = { period: period, values: E1 }
  let E2 = EMA.calculate(input2e2)
  let cutedE1 = E1.slice(period - 1)
  let DEMA = cutedE1.map((e1Item, index) => {
    let res = Big(2).times(e1Item).minus(E2[index]).valueOf()
    return res
  })
  return DEMA
}

function holdPercent(closeList, period = 432, direction, length = 120) {
  //计算每个K线的dema
  let demaList = DEMA(closeList)
  if (length > (closeList.length - 2 * period + 2)) {
    console.error("计算holdPercent所需K线长度不够");
    return
  }
  let cutedCloseList = closeList.slice(-length)
  let cutedDemaList = demaList.slice(-length)
  let i = 0
  cutedDemaList.forEach((demaItem, index) => {
    if (cutedCloseList[index] > demaItem) {
      i += 1
    }
  })
  let longPercent = Big(i).div(cutedCloseList.length).valueOf()
  if (direction == "long") {
    return longPercent
  } else if (direction == "short") {
    return Big(1).minus(longPercent).valueOf()
  } else {
    console.error("检查direction");
  }
}

module.exports = holdPercent
