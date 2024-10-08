let EMA = require('technicalindicators').EMA
import {Big} from "big.js"

export default function DEMAFunc (closeList, period = 12) {
  let input2e1 = { period: period, values: closeList }
  let E1 = EMA.calculate(input2e1)
  let input2e2 = { period: period, values: E1 }
  let E2 = EMA.calculate(input2e2)
  let cutedE1 = E1.slice(period - 1)
  let DEMA = cutedE1.map((e1Item, index) => {
    let res =  Big(2)
      .times(e1Item)
      .minus(E2[index])
      .valueOf()
    return res
  })
  return DEMA
}