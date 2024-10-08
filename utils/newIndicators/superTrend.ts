// let  = require('node-super-trend')
import ST from "node-super-trend"

 export default function superTrend(originKLineList, ATRlength = 10, factor = 3) {
  return new ST(originKLineList, ATRlength, factor).calculate()
}
