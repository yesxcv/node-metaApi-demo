/**
 * 历史波动率计算
 * 1.计算单位时间标的的资产波动Rn
 * 2.计算一段时期内标的的资产价格对均值的平均偏离程度
 * @param  
 * 3.年化标准差
 */
function RnCalc(x, y) {
  return Math.log(x / y)
}

function standardDeviationCalc(list) {
  let totalRn = list.reduce((x, y) => {
    return x + y
  })
  let Ravg = totalRn / list.length
  let devItemMethod = (item) => {
    return Math.pow(item - Ravg, 2) / (list.length - 1)
  }
  //方差
  let variance = list.reduce((x, y) => {
    return devItemMethod(x) + devItemMethod(y)
  })
  //返回标准差
  return (Math.sqrt(variance) * 100).toFixed(4) - 0
}

function historicalVolatility(Karray, period = 10) {
  let length = Karray.length
  if (length < 210) {
    console.log('没有足够的210条数据');
    return
  }
  //取最新的210条数据
  let dataList = Karray.slice(length - 210)
  //计算每一项的当日收益率,得到200条当日收益率
  let dataListRn = dataList.map((item, index) => {
    if (index < 10) {
      return null
    } else {
      return RnCalc(dataList[index], dataList[index - 1])
    }
  })
  dataListRn = dataListRn.slice(10)
  //计算标准差
  let standardDeviation = dataListRn.map((item, index) => {
    if (index < period - 1) {
      return null
    } else if (index + 1 !== dataListRn.length) {
      return standardDeviationCalc(dataListRn.slice(index + 1 - period, index + 1))
    } else {
      return standardDeviationCalc(dataListRn.slice(index + 1 - period))
    }
  })
  return standardDeviation.slice(period)
}


module.exports = historicalVolatility
