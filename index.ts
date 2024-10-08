
import { SynchronizationListener } from "metaapi.cloud-sdk"

//终端初始化
let MetaApi = require('metaapi.cloud-sdk').default

let { token, accountId } = require('./assets/ex_config')

const api = new MetaApi(token)
const _ = require('lodash')
let quoteListener, account
import totalConfig from "./assets/totalConfig.json"
let {tradeConfig:{symbol, interval } } = totalConfig
const tradeComponent = require('./trade/components/index')
let {
  positionInit,
  refreshPosition,
} = require('./trade/positionManage/positionIndex')
let { strategyStatusInit } = require('./trade/strategy/strategyStatus.ts')
let moment = require('moment-timezone')
let throttleTrdeFunc = _.throttle(
  () => {
    tradeComponent()
  },
  1000,
  {
    leading: true,
    trailing: false,
  }
)

class QuoteListener extends SynchronizationListener {
  constructor(){
    super()
  }
  async onConnected() {
    console.error(
      'MT connect connected',
      moment().utc().format('YYYY-MM-DD HH:mm:ss.SSS')
    )
  }

  async onDisconnected() {
    console.error(
      'MT connect disconnect',
      moment().utc().format('YYYY-MM-DD HH:mm:ss.SSS')
    )
  }
  async onBrokerConnectionStatus(connected) {
    console.error(`34 onBrokerConnectionStatus`, connected)
  }

  async onPositionUpdated(instanceIndex, position) {
    refreshPosition({ symbol })
  }
  async onPositionRemoved(instanceIndex, position) {
    refreshPosition({ symbol })
  }

  async onSymbolPriceUpdated(instanceIndex, price) {
    if (price.symbol === symbol) {
      // console.log(symbol + ' price updated')
    }
  }
  async onCandlesUpdated(instanceIndex, candles) {
    for (let candle of candles) {
      if (candle.symbol == symbol && candle.timeframe == interval) {
        if (global.candlesInitFinish) {
          //市场行情驱动业务
          candleUpdate(candle).then(() => {
            throttleTrdeFunc()
          })
        } else {
          console.log(38, 'waiting candlesInitFinish')
        }
      }
    }
  }
  async onTicksUpdated(instanceIndex, ticks) {
    for (let tick of ticks) {
      if (tick.symbol === symbol) {
        console.log(symbol + ' tick updated', tick)
      }
    }
  }
  async onBooksUpdated(instanceIndex, books) {
    for (let book of books) {
      if (book.symbol === symbol) {
        console.log(symbol + ' order book updated', book)
      }
    }
  }
  async onSubscriptionDowngraded(
    instanceIndex,
    symbol,
    updates,
    unsubscriptions
  ) {
    console.log(
      'Market data subscriptions for ' +
        symbol +
        ' were downgraded by the server due to rate limits'
    )
  }
}
function eventListenerInit() {
  quoteListener = new QuoteListener()
}

function tradeTerminalStateInit() {
  return new Promise(async (resolve, reject) => {
    try {
      account = await api.metatraderAccountApi.getAccount(accountId + '')
      global.connection = account.getStreamingConnection()
      global.connection.addSynchronizationListener(quoteListener)
      await global.connection.connect()
      global.terminalState = global.connection.terminalState
      await global.connection.waitSynchronized()
      global.historyStorage = global.connection.historyStorage
      console.log(82, `terminalStateInit success`)

      console.log(`account infomition`, global.terminalState.accountInformation)
      console.log(
        `symbol specification`,
        global.terminalState.specification(symbol)
      )
      console.log(
        `tradeSessions`,
        global.terminalState.specification(symbol).tradeSessions
      )
      candlesInit()
      resolve(``)
    } catch (error) {
      reject(error)
    }
  })
}

async function candlesInit() {
  global.candlesInitFinish = false
  let pages = 2
  let pageSize = 500
  console.log(`Downloading ${pageSize} latest candles for ${symbol}`)
  let startTime
  global.candles = []
  try {
    for (let i = 0; i < pages; i++) {
      let newCandles = await account.getHistoricalCandles(
        symbol,
        interval,
        startTime,
        pageSize
      )
      newCandles = newCandles.sort((a, b) => {
        b.time < a.time ? 1 : -1
      })
      console.log(
        `Downloaded ${
          newCandles ? newCandles.length : 0
        } historical candles for ${symbol}`
      )
      if (newCandles && newCandles.length) {
        global.candles = newCandles.concat(global.candles)
      }
      if (global.candles && global.candles.length) {
        startTime = global.candles[0].time
        console.log(
          `First candle time is ${startTime},download ${global.candles.length} candle`
        )
      }
    }
  } catch (error) {
    console.error(`candle init Error,retry after 1m`, error)
    setTimeout(() => {
      candlesInit()
    }, 1000 * 60)
  }

  if (global.candles.length == pages * pageSize) {
    global.candles = global.candles.map((item) => {
      return [
        item.time,
        item.open,
        item.high,
        item.low,
        item.close,
        item.tickVolume,
      ]
    })
    global.candlesInitFinish = true
    console.log(93, `all candle download`)
  }
  await global.connection.subscribeToMarketData(symbol, [
    {
      type: 'candles',
      timeframe: interval,
      intervalInMilliseconds: 1000,
    },
  ])
  let { path } = global.terminalState.specification(
    symbol
  )
  if(path.startsWith(`Crypto`)) return
  let symbolPrice = global.terminalState.price(symbol)
  if (!symbolPrice) {
    console.error(147, `get symbol price failed ,restart in 10 seconds`,`symbolPrice:${symbolPrice}`)
    console.log(147, `get symbol price failed ,restart in 10 seconds`,`symbolPrice:${symbolPrice}`)
    return setTimeout(() => {
      main()
    }, 10 * 1000)
  }
}

function candleUpdate(newCandle) {
  // console.log(`newCandle push in`, newCandle)
  let newhistoryCandle = global.candles.slice(-1)[0]
  let dataTimeDiff = newCandle.time.getTime() - newhistoryCandle[0].getTime()
  let diffTimeVal //该interval级别下每两个K线的开仓时间差
  let newCandleTemp = [
    newCandle.time,
    newCandle.open,
    newCandle.high,
    newCandle.low,
    newCandle.close,
    newCandle.tickVolume,
  ]
  return new Promise((resolve,reject)=>{
    if (dataTimeDiff == 0) {
      global.candles.splice(-1, 1, newCandleTemp)
      resolve(`success`)
    } else {
      if (newCandle.timeframe.includes('m')) {
        diffTimeVal = 60 * 1000 * newCandle.timeframe.split('m')[0] //分钟级别
      } else if (newCandle.timeframe.includes('h')) {
        diffTimeVal = 60 * 60 * 1000 * newCandle.timeframe.split('h')[0] //小时级别
      } else {
        return console.error(
          110,
          `暂不支持处理${newCandle.timeframe}级别的candles`
        )
      }
      if (dataTimeDiff == diffTimeVal) {
        console.log(128, `更新${symbol}candle数据`)
        global.candles.push(newCandleTemp)
        if (global.candles.length > 2000) {
          global.candles.shift()
        }
      } else {
        if (dataTimeDiff > diffTimeVal && global.candlesInitFinish == true) {
          console.error(
            `140 ${symbol} candle history data old,refleshing  ${dataTimeDiff} ${diffTimeVal} ${global.candlesInitFinish}`
          )
          candlesInit()
        } else if (
          dataTimeDiff < diffTimeVal &&
          dataTimeDiff % diffTimeVal == 0
        ) {
          let newCandleTemp = [
            newCandle.time,
            newCandle.open,
            newCandle.high,
            newCandle.low,
            newCandle.close,
            newCandle.tickVolume,
          ]
          let index = dataTimeDiff / diffTimeVal - 1
          if (
            global.candles.slice(index)[0][0].getTime() ==
            newCandle.time.getTime()
          ) {
            global.candles.splice(index, 1, newCandleTemp)
          } else {
            console.log(
              271,
              `candles数据更新异常`,
              global.candles.slice(index)[0][0],
              newCandle.time
            )
          }
        } else {
          console.error(
            `${symbol} candles diffTimeVal数据异常`,
            newCandle.time.getTime(),
            newhistoryCandle[0].getTime(),
            newCandle.time,
            dataTimeDiff,
            diffTimeVal
          )
          reject()
        }
      }
    }
  })
  

}

async function main() {
  eventListenerInit()
  await tradeTerminalStateInit()
  strategyStatusInit()
  positionInit()
}
main()
