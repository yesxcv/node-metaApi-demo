function getTickSize({symbol}){
    let precisionVal
    let { tickSize} = global.terminalState.specification(symbol)
    if (tickSize.toString().includes('.')) {
      precisionVal = tickSize.toString().split('.')[1].length //报价精度
    } else {
      precisionVal = 0
    }
    return precisionVal
  }

  export {
    getTickSize
  }