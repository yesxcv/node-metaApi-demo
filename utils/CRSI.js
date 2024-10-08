let technicalindicators = require("technicalindicators")
let upDown = require("./upDownLength.js")
let Big = require('big.js')
let percentRank = require('./percentRank.js');
let dailyReturn = require("./dailyReturn.js")


/**
 * Connors RSI包含三个主要组成部分：
RSI = Wilder开发的标准RSI。这通常是短期RSI。在此示例中，它是3周期RSI。
UpDown Length = 证券价格收盘（高于前一日）或收盘（低于前一日）的连续天数。收盘价以正数表示，收盘价以负数表示。如果证券在前后几天以相同价格平仓，则UpDown Length为0。然后，Connors RSI对UpDown Streak值应用短期RSI。在此示例中，它是2周期的RSI。
ROC =变化率。 ROC采用用户定义的回溯期，并计算该回溯期中低于当日价格变动百分比的值的数量百分比
然后，最终的CRSI计算只需找到三个分量的平均值即可。

CRSI(3,2,100) = [ RSI(3) + RSI(UpDown Length,2) + ROC(100) ] / 3
 */


function CRSI(closeList) {
  let RSI = technicalindicators.RSI
  if (closeList.length < 100) {
    console.log("计算CRSI数据不足");
    return
  }
  let rsi3Val = RSI.calculate({
    period: 3,
    values: closeList
  }).slice(-1)[0]
  //计算upDownLenth
  let upDownLength = upDown(closeList).slice(30)
  let rsiUpDownVal = RSI.calculate({
    period: 2,
    values: upDownLength
  }).slice(-1)[0]

  //计算当日收益率的排序
  let dailyReturnList = dailyReturn(closeList)
  let dailyReturnList100 = dailyReturnList.slice(dailyReturnList.length - 100)
  let percentRankVal = percentRank(dailyReturnList100, dailyReturnList100[dailyReturnList100.length - 1])
  let totalAdd = Big(rsi3Val).plus(rsiUpDownVal).plus(percentRankVal)
  let crsiVal = totalAdd.div(3).valueOf()
  return crsiVal - 0
}

module.exports = CRSI
