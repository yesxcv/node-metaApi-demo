/**
 * v 1.2
 * add trail stop loss
 *
 *
 */

import superTrend from '../../indicators/superTrend_1.2'
import { indicatorCalculator } from '../../indicators/index'
let { positionConfig } = require('../../../assets/totalConfig.json')
let {
  tradeConfig,
  strategyConfig,
} = require('../../../assets/totalConfig.json')
import { inTradeTime } from '../../../utils/util'
import moment from 'moment-timezone'
import { Big } from 'big.js'

function calcTradeCondition({ side }) {
  console.log(`condition cal`, moment().utc().format('YYYY-MM-DD HH:mm:ss.SSS'))
  let condition_open_long,
    condition_open_short,
    clearPostionCondetion_long,
    clearPostionCondetion_short


  //1.是否在交易时间
  let { tradeSessions, path, tickSize } = global.terminalState.specification(
    tradeConfig.symbol
  )
  const inTradeTimeOfSide = inTradeTime({
    tradeSessions,
    path,
    side,
  })
  if (!inTradeTimeOfSide) {
    console.log(`不在交易时间 side ${side}`)
    return {
      condition_open_long: false,
      condition_open_short: false,
      clearPostionCondetion_long: false,
      clearPostionCondetion_short: false,
      tradeOptions: {
        stopLossLong: undefined,
        stopLossShort: undefined,
      },
    }
  }

  let indicatorVal = indicatorCalculator({
    indicatorFunction: superTrend,
    originKLineList: global.candles,
    realTime: false,
  })
  if (!indicatorVal) {
    return {
      condition_open_long: false,
      condition_open_short: false,
      clearPostionCondetion_long: false,
      clearPostionCondetion_short: false,
      tradeOptions: {
        stopLossLong: undefined,
        stopLossShort: undefined,
        trail_offset: undefined,
      },
    }
  }
  let indicatorLength = indicatorVal.length

  let precisionVal
  if (tickSize.toString().includes('.')) {
    precisionVal = tickSize.toString().split('.')[1].length //报价精度
  } else {
    precisionVal = 0
  }

  let { holdWeight } = global.positionStatus
  let KlineNew = global.candles.slice(-1)[0]

  console.table(indicatorVal.map(item=>{
    return {
      ...item
    }
  }), ['index', 'STval'])
  let logInfo
  var pricePercStopOfLong = Number( Big(global.positionStatus.avgPrice || KlineNew[4])
  .times(100 - strategyConfig.superTrend.stopLosePerc)
  .div(100)
  .valueOf()).toFixed(precisionVal)
var pricePercStopOfShort = Number(Big(global.positionStatus.avgPrice || KlineNew[4])
  .times(100 + strategyConfig.superTrend.stopLosePerc)
  .div(100)
  .valueOf()).toFixed(precisionVal)

  if (side == 'open') {
    // 1.have none position
    //2.同一根K线，同一方向，只开仓一次
    let thisKlineAllowOpen = (positionSide) => {
      let newTime = new Date()
      //查询当前K线的交易历史
      let symbolDeals = global.historyStorage
        .getHistoryOrdersByTimeRange(KlineNew[0], newTime)
        .filter((item) => {
          return item.symbol == tradeConfig.symbol
        })
        .sort((a, b) => {
          return a.time - b.time
        })
      if (!['LONG', 'SHORT'].includes(positionSide)) {
        return console.log(`计算当前candles是否错误`)
      }
      if (symbolDeals.length == 0) return true
      //当前k线，symbol有交易记录，要求没有与交易方向同方向的订单
      if (
        positionSide == 'LONG' &&
        !symbolDeals.some(
          (item) => item.type == 'ORDER_TYPE_BUY' && item.comment == 'LONG'
        )
      ) {
        return true
      }
      if (
        positionSide == 'SHORT' &&
        !symbolDeals.some(
          (item) => item.type == 'ORDER_TYPE_SELL' && item.comment == 'SHORT'
        )
      ) {
        return true
      }
      return false
    }

    //3 trend 方向变化
    let trendChangeLong =
      indicatorVal[indicatorLength - 3].STval.trend == 'short' &&
      indicatorVal[indicatorLength - 2].STval.trend == 'long'
    let trendChangeShort =
      indicatorVal[indicatorLength - 3].STval.trend == 'long' &&
      indicatorVal[indicatorLength - 2].STval.trend == 'short'



    //open position 条件
    condition_open_long =
      holdWeight == 0 &&
      thisKlineAllowOpen('LONG') &&
      trendChangeLong
    condition_open_short =
      holdWeight == 0 &&
      thisKlineAllowOpen('SHORT') &&
      trendChangeShort

      // let {
      //   TSL:{trailOffsetPrice} ,
      // } = indicatorVal[indicatorLength - 1]
      // trailOffset =  Number(Number(trailOffsetPrice).toFixed(precisionVal))

    logInfo = () => {
      console.table([
        [
          'open long 条件',
          condition_open_long,
          'open short条件',
          condition_open_short,
        ],
        ['holdWeight', holdWeight == 0, 'holdWeight', holdWeight == 0],
        [
          'thisKlineAllowOpen',
          thisKlineAllowOpen('LONG'),
          'thisKlineAllowOpen',
          thisKlineAllowOpen('SHORT'),
        ],
        [
          'trendChangeLong',
          trendChangeLong,
          'trendChangeShort',
          trendChangeShort,
        ]
      ])
    }
  } else if (side == 'close') {
    // condition 1 technical condition[  superTrend ]
    let trendCloseOfLong =
      indicatorVal[indicatorLength - 3].STval.trend == 'long' &&
      indicatorVal[indicatorLength - 2].STval.trend == 'short'
    let trendCloseOfShort =
      indicatorVal[indicatorLength - 3].STval.trend == 'short' &&
      indicatorVal[indicatorLength - 2].STval.trend == 'long'



    clearPostionCondetion_long =
      holdWeight > 0 &&
      trendCloseOfLong&&
      global.positionStatus.positionSide == 'LONG'
    clearPostionCondetion_short =
      holdWeight > 0 &&
      trendCloseOfShort  &&
      global.positionStatus.positionSide == 'SHORT'

    logInfo = () => {
      //打印一些交易数据
      console.table([
        ['最新价格', KlineNew[4]],
        ['开盘价', KlineNew[1]],
        ['仓位方向', global.positionStatus.positionSide],
        ['开仓价格', global.positionStatus.avgPrice],
      ])

      console.table([
        [
          '平多仓条件',
          clearPostionCondetion_long,
          `平空仓条件`,
          clearPostionCondetion_short,
        ],
        [
          'holdWeight',
          holdWeight > 0,
          'holdWeight',
          holdWeight > 0,
        ],
        [
          'trendCloseOfLong',
          trendCloseOfLong,
          'trendCloseOfShort',
          trendCloseOfShort,
        ],
        [
          'positionSide',
          global.positionStatus.positionSide == 'LONG',
          'positionSide',
          global.positionStatus.positionSide == 'SHORT',
        ],
      ])
    }
  } else {
    console.error(255, `params side error`)
  }
  logInfo()
  return {
    condition_open_long,
    condition_open_short,
    clearPostionCondetion_long,
    clearPostionCondetion_short,
    tradeOptions: {
      stopLossLong: pricePercStopOfLong,
      stopLossShort: pricePercStopOfShort,
    },
  }
}

module.exports = calcTradeCondition
