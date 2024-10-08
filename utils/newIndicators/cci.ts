import { CCI } from "technicalindicators"

export default function calcCCI (orginKLine, period = 1100) {
  let input = {
    open: [],
    high: [],
    low: [],
    close: [],
    period: period
  }
  orginKLine.map(klineItem => {
    input.open.push(klineItem[1])
    input.close.push(klineItem[4])
    input.high.push(klineItem[2])
    input.low.push(klineItem[3])
  })
  return CCI.calculate(input)
}