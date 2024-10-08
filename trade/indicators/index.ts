//为节省性能,根据需求计算指标的值
/**
 * @param {*} originKLineList 原始K线
 * @param realTime 开始实时计算
 */
function indicatorCalculator({
  indicatorFunction,
  originKLineList,
  realTime = false,
}) {
  if (!indicatorFunction || !originKLineList) {
    return console.error(`缺少计算指标的参数`)
  }
  if(!global.candlesInitFinish){
    return console.error(`等待candles初始化完成`)
  }
  if (realTime) {
    return indicatorFunction(originKLineList)
  } else {
    let newKlineId
	try{
	newKlineId = originKLineList.slice(-1)[0][0].getTime()
	}catch(e){
		//TODO handle the exception
		console.error(e,`K线错误`,originKLineList);
	}
    if (global.indicatorValResult.kLineId == newKlineId) {
      return global.indicatorValResult.value
    } else if (global.indicatorValResult.kLineId < newKlineId) {
      //推送了新的行情数据，计算新的indicatorVal
      global.indicatorValResult.value = indicatorFunction(originKLineList)
      global.indicatorValResult.kLineId = newKlineId
      return global.indicatorValResult.value
    } else {
      console.log(26, global.indicatorValResult.kLineId, newKlineId)
      return console.error(22, `指标计算错误`)
    }
  }
}

export {
  indicatorCalculator
}
