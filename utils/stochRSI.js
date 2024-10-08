let stochRsi = require("technicalindicators").stochasticrsi

function stochRsiFunc(closeList, rsiPeriod = 14, stochasticPeriod = 14, kPeriod = 3, dPeriod = 3) {
  let input = {
    values: closeList,
    rsiPeriod: rsiPeriod,
    stochasticPeriod: stochasticPeriod,
    kPeriod: kPeriod,
    dPeriod: dPeriod
  }
  let res = stochRsi(input)
  return res.slice(-1)[0]
}

module.exports = stochRsiFunc