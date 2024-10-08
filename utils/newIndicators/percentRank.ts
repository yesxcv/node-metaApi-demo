/**
 * percentRank的lib文件
 */
import {Big} from "big.js"

function percentRank (data, value) {
  const sortedData = data.slice().sort((a, b) => a - b)
  const count = sortedData.filter(x => x <= value).length
  const percentRank = Big(count)
    .div(sortedData.length)
    .times(100)
    .valueOf()
  return percentRank
}
export {
  percentRank
}
