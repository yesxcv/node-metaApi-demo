let ATRIndicator = require('technicalindicators').ATR;


function ATRfunc(orginKLineList, period = 14) {
  let input = {
    high: [],
    low: [],
    close: [],
    period: period
  }
  orginKLineList.forEach((item) => {
    input.high.push(item[2] - 0)
    input.low.push(item[3] - 0)
    input.close.push(item[4] - 0)
  })
  let res = ATRIndicator.calculate(input)
  return res
}
export default  ATRfunc