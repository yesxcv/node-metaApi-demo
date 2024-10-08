let SMA = require('technicalindicators').SMA;
let Big = require('big.js')


function EOMFunc(orginKline, length = 14, div = 10000) {
  let eomList = []
  orginKline.forEach((item, index) => {
    if (index < 1) {
      return
    }
    let itemAvg = (Big(item[2]).plus(Big(item[3]))).div(2)
    let preItem = orginKline[index - 1]
    let preItemAvg = (Big(preItem[2]).plus(Big(preItem[3]))).div(2)
    let change = itemAvg.minus(preItemAvg)
    // div * change(hl2) * (high - low) / volume
    let emv = Big(div).times(change).times(Big(item[2]).minus(item[3])).div(Big(item[5])).valueOf()
    eomList.push(emv - 0)
  })
  let res = SMA.calculate({ period: length, values: eomList })
  return res.slice(-1)[0]
}

module.exports = EOMFunc