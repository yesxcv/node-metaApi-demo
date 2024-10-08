import { EMA } from "technicalindicators"
let voList = []

export default function VO (volumeList, shortPeriod = 5, longPeriod = 10) {
  voList = volumeList.map((volume, index) => {
    if (index > longPeriod) {
      let voListForCalc = volumeList.slice(0, index + 1)
      //长周期EMA
      let longPeriodEMA = EMA.calculate({
        period: longPeriod,
        values: voListForCalc
      })
      //短周期EMA
      let shortPeriodEMA = EMA.calculate({
        period: shortPeriod,
        values: voListForCalc
      })
      let shortPeriodEMAValue = shortPeriodEMA.slice(-1)[0]
      let longPeriodEMAValue = longPeriodEMA.slice(-1)[0]
      let vo =
        ((shortPeriodEMAValue - longPeriodEMAValue) / longPeriodEMAValue) * 100
      return vo
    } else {
      return null
    }
  })
  return voList
}
