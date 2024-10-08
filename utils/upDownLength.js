/**
 * @param {Object} arrayList  传入收盘价数据,数据长度需大于30
 */

function upDownLengthFunc(arrayList) {
  let upDownLength = arrayList.map((item, index) => {
    if(index < 30 ){
      return "pass"
    }
    let direction = null //null初始化0平1多2少
    let count = 0
    if (arrayList[index] > arrayList[index - 1]) {
      direction = 1
    } else if (arrayList[index] < arrayList[index - 1]) {
      direction = 2
    } else if (arrayList[index] = arrayList[index - 1]) {
      direction = 0
      return 0
    } else {
      return 'error'
    }
    switch (direction) {
      case 1:
        while (arrayList[index] > arrayList[index - 1]) {
          count += 1
          index -= 1
        }
        return count
        break
      case 2:
        while (arrayList[index] < arrayList[index - 1]) {
          count -= 1
          index -= 1
        }
        return count
        break
    }
  })
  return upDownLength
}

module.exports = upDownLengthFunc