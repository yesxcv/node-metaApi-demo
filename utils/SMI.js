let EMA = require('technicalindicators').EMA
let TSI = require("./TSI")
let Big = require("big.js")


function SMI(closeData, LongPeriod = 20, shortPeriod = 5, siglen = 5) {
  let erg = TSI(closeData, LongPeriod, shortPeriod)
  let sig = EMA.calculate({ values: erg, period: siglen })
  let ergres = erg.slice(siglen - 1)
  let diff = ergres.map((item, index) => {
    return (Big(ergres[index]).minus(sig[index])).div(100).valueOf() - 0
  })
  return diff.slice(-1)[0]
}

module.exports = SMI
