// let EMA = require('technicalindicators').EMA
// let Big = require("big.js")
// let q = 5
// let r = 20
// let s = 5
// let u = 3

// function EMACalc(data, period) {
//   return EMA.calculate({ period: period, values: data })
// }


// function SMIEI(closeDataList) {
//   let DList = []
//   let DLlist = []

//   closeDataList.map((closePrice, index) => {
//     if (index < 19) {
//       return
//     }
//     //index = 20

//     //取当前index往前的q个数字
//     let closeDataForCalc = closeDataList.slice(index - q + 1, index + 1)
//     let sortedPrice = closeDataForCalc.sort((a, b) => {
//       return Big(a).minus(Big(b)).valueOf()
//     })
//     let LL = sortedPrice[0] // 最小
//     let HH = sortedPrice.slice(-1)[0] //最大
//     // M = (HighMAX + LowMIN) /2
//     let M = (HH + LL) * 0.5
//     let D = closeDataList[index] - M
//     let DL = HH - LL
//     DList.push(D)
//     DLlist.push(DL)
//   })
//   let up = EMACalc(EMACalc(DList, 20), 5)
//   let down = EMACalc(EMACalc(DLlist, 20), 5)
//   let SMIList = up.map((item, index) => {
//     return 200 * item / (down[index] * 0.5)
//   })

//   let SMIsignal = EMACalc(SMIList, u)

//   // let upList = closeDataForCalc.map(item => {
//   //   return closeDataList[index] - 0.5 * (LL + HH)
//   // })
//   // let downList = closeDataForCalc.map(item => {
//   //   return (HH - LL) * 0.5
//   // })

//   // let up = EMACalc(EMACalc(EMACalc(qSM, r), s), u) * 100


// }

// module.exports = SMIEI