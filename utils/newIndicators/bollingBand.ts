import {BollingerBands as BB } from "technicalindicators"

function BBfunc(closeList, period = 20, stdDev = 2) {
  let input = {
    period: period,
    values: closeList,
    stdDev: stdDev,
  }
  let res = BB.calculate(input)
  return res
}

export {
  BBfunc
}