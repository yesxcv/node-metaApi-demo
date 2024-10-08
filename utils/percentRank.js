/**
 * percentRank的lib文件
 */
let Big = require("big.js");
const { forEach } = require("lodash");

// R = (P / 100) * (N+1)
// R是排第几名
// P是总数

let percentRank = (arr, value) => {
  arr = arr.sort((a, b) => {
    return Big(a).minus(Big(b)).valueOf()
  })
  let R = null
  let N = arr.length
  arr.forEach((item, index) => {
    if (item == value) {
      R = index + 1
    }
  })
  if (R) {
    return Big(R).div(N + 1).times(100).valueOf()
  } else {
    throw new Error('Out of bounds');
  }


  // for (let i = 0; i < arr.length; i++) {
  //   if (Big(arr[i]).eq(value)) {
  //     return Big(i + 1).div(arr.length + 1).times(100);
  //   }
  // }
};

module.exports = percentRank;
