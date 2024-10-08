import {
  calcPosition,
  refreshPosition
}  from '../positionManage/positionIndex'
let { symbol } = require('../../assets/totalConfig.json').tradeConfig

let calcTradeCondition = require('./tradeCondition/superTrend_1.2')



async function createMarketOrder({
  positionSide,
  symbol,
  volume,
  stopLoss,
  takeProfit,
  options = {},
}) {
  console.dir({
    desc:"handleing Order params",
    positionSide,
    symbol,
    volume,
    stopLoss,
    takeProfit,
    options:JSON.stringify(options),
  })
  let tradeRes
  try {
    if (positionSide == 'LONG') {
      tradeRes = await global.connection.createMarketBuyOrder(
        symbol,
        volume,
        stopLoss,
        takeProfit,
        options
      )
    } else if (positionSide == 'SHORT') {
      tradeRes = await global.connection.createMarketSellOrder(
        symbol,
        volume,
        stopLoss,
        takeProfit,
        options
      )
    }
    console.log(52, tradeRes)
  } catch (e) {
    console.error(`58 createOrderError contimue after 5m`, e)
    setTimeout(() => {
      global.tradeState.orderFilled = true
    }, 1000 * 60 * 5)
  }

  if (tradeRes.numericCode == 10009) {
    console.log(`订单已完成 ${tradeRes.numericCode}`, tradeRes)
  } else {
    console.error(`请检查订单状态`, tradeRes)
  }
  let checkPositionInterval = setInterval(() => {
    let symbolPositionList = global.terminalState.positions.filter((item) => {
      return item.symbol == symbol
    })
    let positionAmount = symbolPositionList.length
    if (positionAmount > 0) {
      refreshPosition({ symbol })
      global.tradeState.orderFilled = true
      clearInterval(checkPositionInterval)
    } else {
      console.log(`waiting for position sync`)
    }
  }, 1000)
}

async function closePostion(symbol) {
  if (global.tradeState.orderFilled == false) {
    return console.log(` waiting orderfill`)
  }
  global.tradeState.orderFilled = false
  try {
    await global.connection.closePositionsBySymbol(symbol)
  } catch (e) {
    console.error(`82 closePosition error,retry after 10s`, e)
    setTimeout(() => {
      global.tradeState.orderFilled = true
    }, 10 * 1000)
  }
  refreshPosition({ symbol })
  global.tradeState.orderFilled = true
  console.log(35, `close position success`)
}

async function tradeMain() {
  let symbolPositionList = global.terminalState.positions.filter((item) => {
    return item.symbol == symbol
  })
  let positionAmount = symbolPositionList.length
  if (positionAmount == 0) {
    let { condition_open_long, condition_open_short,tradeOptions:{stopLossLong,stopLossShort} } = calcTradeCondition({
      side: 'open',
    })

    if (condition_open_long == true) {
		if (global.tradeState.orderFilled == false) {
		  return console.log(`36,waiting order fill`)
		}
		global.tradeState.orderFilled = false
      let positionSide = 'LONG'
      let side = 'BUY'
      let marginVal = await calcPosition({
        symbol,
        side,
        positionSide,
        holdWeight: 2,
      })
      if (marginVal == null) return console.error(`下单取消`)
      createMarketOrder({
        positionSide,
        symbol,
        volume: marginVal.quantity,
        takeProfit:undefined,
        stopLoss:stopLossLong,
        options: {
          comment: positionSide
        },
      })
    } else if (condition_open_short == true) {
		if (global.tradeState.orderFilled == false) {
		  return console.log(`36,waiting order fill`)
		}
		global.tradeState.orderFilled = false
      let positionSide = 'SHORT'
      let side = 'SELL'
      let marginVal = await calcPosition({
        symbol,
        side,
        positionSide,
        holdWeight: 2,
      })
      if (marginVal == null) return console.error(`下单取消`)
      createMarketOrder({
        positionSide,
        symbol,
        volume: marginVal.quantity,
        takeProfit:undefined,
        stopLoss:stopLossShort,
        options: {
          comment: positionSide,
        },
      })
    }
  } else if (positionAmount == 1) {
    let { clearPostionCondetion_long, clearPostionCondetion_short } =
      calcTradeCondition({
        side: 'close',
      })
    if (clearPostionCondetion_long || clearPostionCondetion_short) {
      closePostion(symbol + '')
    }
  } else {
    console.log(51, `more than one position`)
    closePostion(symbol + '')
    console.log(168, `positionAmount`, positionAmount)
  }
}
module.exports = tradeMain
