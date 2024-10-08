let ADX = require('technicalindicators').ADX;


function calcADX(orginKLine, period) {
  let input = {
    close: [],
    high: [],
    low: [],
    period: period
  }
  orginKLine.forEach((klineItem) => {
    input.close.push(klineItem[4])
    input.high.push(klineItem[2])
    input.low.push(klineItem[3])
  })
  let res = ADX.calculate(input)
  return res.slice(-1)[0]
}

module.exports = calcADX