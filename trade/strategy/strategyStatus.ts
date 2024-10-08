let {strategyConfig} = require('../../assets/totalConfig.json')
function strategyStatusInit() {
  global.tradeState = {
    orderFilled: null,
  }
  global.TSLstate = {
    orderId: null,
    tslPuted: false,
    modifying:false,
    tslPrice: {
      long: null,
      short: null,
      offSet: null,
    },
  }
  global.indicatorValResult = {
    kLineId: 0, //在哪条最新的K线计算的结果
    value: undefined,
  }
}

/**
 *    订单生成以后，处理订单成交导致的交易策略状态的变更
 * */

// function updateTSLstate({ positionItem,clean = false }) {
//   if (clean) {
//     global.TSLstate.orderId = null
//     global.TSLstate.tslPuted = false
//     global.TSLstate.modifying = false
//     global.TSLstate.tslPrice = {
//       long: null,
//       short: null,
//       offSet: null,
//     }
//   } else {
//     let timer =  setInterval(() => {
//       if(global.indicatorValResult.value){
//         let atrVal = global.indicatorValResult.value.slice(-1)[0].ATR
//         let tsldata = calcTsl(atrVal)
//         global.TSLstate.tslPrice = {
//           long: tsldata.activePriceLong,
//           short: tsldata.activePriceShort,
//           offSet: tsldata.trailOffsetPrice,
//         }
//         global.TSLstate.orderId = positionItem.id
//         clearInterval(timer)
//       }
//     }, 1000);
//   }
// }

export { strategyStatusInit }
