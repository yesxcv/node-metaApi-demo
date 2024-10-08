let technicalindicators = require('technicalindicators')
import  Big  from "big.js"
let upDown = require('./upDownLength.js')
let percentRank = require('./percentRank.js')

/**
 * Connors RSI包含三个主要组成部分：
RSI = Wilder开发的标准RSI。这通常是短期RSI。在此示例中，它是3周期RSI。
UpDown Length = 证券价格收盘（高于前一日）或收盘（低于前一日）的连续天数。收盘价以正数表示，收盘价以负数表示。如果证券在前后几天以相同价格平仓，则UpDown Length为0。然后，Connors RSI对UpDown Streak值应用短期RSI。在此示例中，它是2周期的RSI。
ROC =变化率。 ROC采用用户定义的回溯期，并计算该回溯期中低于当日价格变动百分比的值的数量百分比
然后，最终的CRSI计算只需找到三个分量的平均值即可。

CRSI(3,2,100) = [ RSI(3) + RSI(UpDown Length,2) + ROC(100) ] / 3
 */

export default function CRSI ({
  closeList,
  RSIperiod = 3,
  updownPeriod = 2,
  ROClength = 100
}) {
  let RSI = technicalindicators.RSI
  if (closeList.length < 100) {
    console.log('计算CRSI数据不足')
    return
  }
  let rsi3Val = RSI.calculate({
    period: RSIperiod,
    values: closeList
  })
  //计算upDownLenth
  let upDownLength = upDown(closeList)
  let rsiUpDownVal = RSI.calculate({
    period: updownPeriod,
    values: upDownLength
  })

  //计算最新的收益率数据
  let dailyReturnList = technicalindicators.ROC.calculate({
    period: 1,
    values: closeList
  })
  //计算当前K线收益率在回溯周期里的排行
  let getPercentRank = index => {
    let dailyReturnListROClength = dailyReturnList.slice(
      dailyReturnList.length + index + 1 - ROClength,
      dailyReturnList.length + index + 1
    )
    //index 为负数 -1代表最后一个
    return percentRank(
      dailyReturnListROClength,
      dailyReturnListROClength.slice(-1)[0]
    )
  }

  let crsiList = [-7, -6, -5, -4, -3, -2, -1].map(index => {
    let totalAdd = Big(rsi3Val.slice(index)[0])
      .plus(rsiUpDownVal.slice(index)[0])
      .plus(getPercentRank(index))
    return Number(totalAdd.div(3).valueOf()) 
  })
  return crsiList
}

