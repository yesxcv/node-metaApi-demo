let BB = require('technicalindicators').BollingerBands

function BBfunc(closeList, period = 20, stdDev = 2) {
  let input = {
    period: period,
    values: closeList,
    stdDev: stdDev
  }
  let res = BB.calculate(input)
  return res.slice(-1)[0]
}

module.exports = BBfunc