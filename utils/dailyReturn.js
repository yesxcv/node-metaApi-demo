let Big = require("big.js")

/**
 * @param {Object} arrayList
 * 计算每日收益率
 */
function dailyReturn(arrayList) {
  let dailyReturnList = []
   arrayList.forEach((item, index) => {
    if (index > 0) {
     dailyReturnList.push((Big(arrayList[index]).minus(Big(arrayList[index - 1]))).div(arrayList[index - 1]).valueOf()) 
    }
  })
  return dailyReturnList
}

module.exports = dailyReturn