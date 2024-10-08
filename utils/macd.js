let MACD_INDACATOR = require("technicalindicators").MACD;

function MACD_func(closeList, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9, SimpleMAOscillator = false, SimpleMASignal = false) {
  let macdInput = {
    values: closeList,
    fastPeriod,
    slowPeriod,
    signalPeriod,
    SimpleMAOscillator,
    SimpleMASignal,
  }
  let res = MACD_INDACATOR.calculate(macdInput)
  return res.slice(-1)[0]
}

module.exports = MACD_func