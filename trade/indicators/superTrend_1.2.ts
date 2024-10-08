/**
 */
import ST from '../../utils/newIndicators/superTrend'

let {
  IndicatorConfig,
  strategyConfig,
} = require('../../assets/totalConfig.json')

/**
 * @param {Object} originKLineList   必填
 * @param {Object} position  -1代表倒数第一个 -2代表倒数第二个  必填
 */
export default function SuperTrend(originKLineList) {
  let SuperTrendList = ST(originKLineList)
  let indexList = [-6, -5, -4, -3, -2, -1]
  let SP_List = indexList.map((index) => {
    return {
      index: index,
      STval: SuperTrendList.slice(index)[0],
    }
  })
  return SP_List
}

