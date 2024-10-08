let EMA = require('technicalindicators').EMA

function EMAfunc (closeList, period = 12) {
  let input = { period: period, values: closeList }
  let res = EMA.calculate(input)
  return res
}

module.exports = EMAfunc
