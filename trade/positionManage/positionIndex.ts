import Big from 'big.js'
let { symbol } = require('../../assets/totalConfig.json').tradeConfig
let { positionConfig } = require('../../assets/totalConfig.json')

/**
 * interface exchangeItem
 * {
 *  symbol:"",
 *  avgPrice:"", // 平均成交价
 *  side:"",//买卖方向 BUY SELL
 *  positionSide: '' //持仓方向 unkown未知 LONG SHORT
 *  kid:""
 *
 * }
 */

// function getuserTradeList ({ symbol }) {
//   console.log(`历史成交记录更新中`)
//   global.tradeListRefreshed = false
//   return new Promise((resolve, reject) => {
//     APIs.userTradeList(getParamsWithSign({ symbol }))
//       .then(res => {
//         global.exchangeRecords = res
//         console.log(`账户 ${symbol} 交易历史获取成功,3s后恢复交易`)
//         global.tradeListRefreshed = true
//         resolve(res)
//       })
//       .catch(e => {
//         reject(e)
//       })
//   })
// }

/**
 * 仓位的变换路线
 * 空仓-一直空仓
 * 空仓-轻仓-平仓
 * 空仓-轻仓-重仓-平仓
 */
async function positionInit() {
  console.log(`position init`)
  //持仓状态
  global.positionStatus = {
    symbol: symbol,
    id:null,
    holdWeight: '-1', //-1未知 0空仓 1轻仓 2重仓
    positionSide: '-1', //持仓方向 -1未知 0空仓  LONG SHORT
    positionAmt: '',
    avgPrice: '0',
    updateTime: 0,
  }
  refreshPosition({
    symbol,
  })
  console.log(`仓位初始化完成`)
}

function refreshPosition({ symbol }) {
  console.log(`start reflesh Position`)
  let symbolPositionList = global.terminalState.positions.filter((item) => {
    return item.symbol == symbol
  })
  global.positionStatus.symbol = symbol
  if (symbolPositionList.length == 1) {
    let positionItem = symbolPositionList[0]
    global.positionStatus.id = positionItem.id
    global.positionStatus.holdWeight = 2
    global.positionStatus.avgPrice = positionItem.openPrice

    if (positionItem.type == 'POSITION_TYPE_BUY') {
      global.positionStatus.positionSide = `LONG`
    } else if (positionItem.type == 'POSITION_TYPE_SELL') {
      global.positionStatus.positionSide = `SHORT`
    } else {
      console.error(75, `position type error`)
    }
  } else if (symbolPositionList.length == 0) {
    console.log(69, 'no position of ', symbol)
    global.positionStatus.holdWeight = 0
    global.positionStatus.avgPrice = 0
    global.positionStatus.positionSide = 0
  } else {
    console.log(72, 'find more than one positions of symbol', symbol)
  }
}

/**
 * 计算仓位的方法
 * @returns
 * 1.仓位的状态 轻仓 重仓 全部平仓
 * 2.仓位的数量
 * 3.交易的标的
 */


export function getPrecisionVal(symbol){
  let precisionVal
  let { volumeStep: stepSize} = global.terminalState.specification(symbol)
  if (stepSize.toString().includes('.')) {
    precisionVal = stepSize.toString().split('.')[1].length //报价精度
  } else {
    precisionVal = 0
  }
  return precisionVal
}


async function calcPosition({ symbol, side, positionSide, holdWeight }) {
  //get symbol price
  let {
    volumeStep: stepSize,
    contractSize,
    minVolume,
    maxVolume,
  } = global.terminalState.specification(symbol)
  let { path } = global.terminalState.specification(
    symbol
  )
  let ask,bid
  if(!path.startsWith(`Crypto`)){
   ask = global.terminalState.price(symbol).ask
   bid = global.terminalState.price(symbol).bid
  }else{
    ask = bid = global.candles.slice(-1)[0][4]
  }

  let inputProfit
  let precisionVal = getPrecisionVal(symbol)
  let { leverage, freeMargin } = global.terminalState.accountInformation
  //交易最小单位精度数量的标所需保证金的大小
  let getHoldWeight = (holdWeight) => {
    if (holdWeight == '1') return positionConfig.lightPercent
    if (holdWeight == '2') return positionConfig.appendPercent
    if (holdWeight == '0') return positionConfig.minusAppendPercent
    return 0
  }

  if (
    (side == 'BUY' && positionSide == 'LONG') ||
    (side == 'SELL' && positionSide == 'SHORT')
  ) {
    //calc minsize margin
    let cashPerStepSize = await global.connection.calculateMargin({
      symbol,
      type: side == 'SELL' ? 'ORDER_TYPE_BUY' : 'ORDER_TYPE_SELL',
      volume: stepSize,
      openPrice: side == 'SELL' ? ask : bid,
    })
    inputProfit = (
      parseInt(
        Big(freeMargin)
          .times(getHoldWeight(holdWeight))
          .div(cashPerStepSize.margin)
          .abs()
          .valueOf()
      ) * stepSize
    ).toFixed(precisionVal)
  } else if (
    (side == 'BUY' && positionSide == 'SHORT') ||
    (side == 'SELL' && positionSide == 'LONG')
  ) {
    //调用关闭position方法即可,此处不处理交易
  }
  if (inputProfit < minVolume) {
    console.error(150, `交易量小于最小交易数量`)
    return null
  }
  if (inputProfit > maxVolume) {
    inputProfit = maxVolume
  }
  return {
    quantity: Number(inputProfit),
    holdWeight: holdWeight,
    precisionVal
  }
}
export  {
  positionInit,
  calcPosition,
  refreshPosition,
}
