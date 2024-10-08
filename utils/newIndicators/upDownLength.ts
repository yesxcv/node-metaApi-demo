/**
 * @param {Object} arrayList  传入收盘价数据,数据长度需大于30
 */
function getUpdown (s) {
  let ud = 0
  for (let i = 1; i < s.length; i++) {
    let isEqual = s[i] == s[i - 1]
    let isGrowing = s[i] > s[i - 1]
    if (isEqual) {
      ud = 0
    } else if (isGrowing) {
      ud = ud <= 0 ? 1 : ud + 1
    } else {
      ud = ud >= 0 ? -1 : ud - 1
    }
  }
  return ud
}

function Updown (data) {
  return data.map((item, index) => {
    if (index < 2) return 0
    return getUpdown(data.slice(0, index + 1))
  })
}

// function upDownLengthFunc (arrayList) {
//   let upDownLength = arrayList.map((item, index) => {
//     if (index < 3) {
//       return 0
//     }
//     let direction = null //null初始化0平1多2少
//     let count = 0
//     if (arrayList[index] > arrayList[index - 1]) {
//       direction = 1
//     } else if (arrayList[index] < arrayList[index - 1]) {
//       direction = 2
//     } else if (arrayList[index] == arrayList[index - 1]) {
//       direction = 0
//       return 0
//     } else {
//       return 'error'
//     }
//     switch (direction) {
//       case 1:
//         while (arrayList[index] > arrayList[index - 1]) {
//           count += 1
//           index -= 1
//         }
//         return count
//         break
//       case 2:
//         while (arrayList[index] < arrayList[index - 1]) {
//           count -= 1
//           index -= 1
//         }
//         return count
//         break
//     }
//   })
//   return upDownLength
// }

module.exports = Updown
