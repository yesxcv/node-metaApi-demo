import {Big} from "big.js"
/**
 * @param {Object} arrayList
 * 计算每日收益率
 */
export default function dailyReturn (arrayList) {
  let dailyReturnList = []
  arrayList.forEach((item, index) => {
    if (index > 0) {
      let diff = Big(arrayList[index]).minus(Big(arrayList[index - 1]))
      let radio = diff.div(arrayList[index - 1]).valueOf()
      dailyReturnList.push(radio)
    }
  })
  return dailyReturnList
}

