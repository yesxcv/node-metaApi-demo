import { ATR,Highest,Lowest } from 'technicalindicators';
import { Big } from 'big.js';


class ChandeKrollStop {
  private atrLength: number;
  private atrMultiplier: number;
  private stopLength: number;
  private highs: number[];
  private lows: number[];
  private closes: number[];

  constructor(atrLength: number, atrMultiplier: number, stopLength: number, highs: number[], lows: number[],closes:number[]) {
    this.atrLength = atrLength;
    this.atrMultiplier = atrMultiplier;
    this.stopLength = stopLength;
    this.highs = highs;
    this.lows = lows;
    this.closes = closes;
  }

  calculateATRList(): number[] {
    const input = {
      high: this.highs,
      low: this.lows,
      close: this.closes,
      period: this.atrLength,
    };
    return  ATR.calculate(input);
  }

  calculateChandeKrollStopArray(): { stopShort: number[]; stopLong: number[] } {

    const atrList = this.calculateATRList().slice(-500);
    let highestList  =  Highest.calculate({
      values:this.highs,
      period:this.atrLength
    }).slice(-500)
    let lowstList = Lowest.calculate({
      values:this.lows,
      period:this.atrLength
    }).slice(-500)
    let first_high_stop_list = highestList.map((item,index)=>{
    return  Number(Big(item).minus(Big(this.atrMultiplier).times(Big(atrList[index]))).valueOf()) 
    })
    let first_low_stop_list = lowstList.map((item,index)=>{
      return Number(Big(this.atrMultiplier).times(Big(atrList[index])).plus(item).valueOf()) 
    })
    let stop_short_list = Highest.calculate({
      values:first_high_stop_list,
      period:this.stopLength
    })
    let stop_long_list = Lowest.calculate({
      values:first_low_stop_list,
      period:this.stopLength
    })
    return {
      stopShort: stop_short_list,
      stopLong: stop_long_list,
    }
  }
}


export  default function calcCCS(originKLineList,atrLength=10,atrMultiplier=1,stopLength=9){
    const highs = originKLineList.map((data) => data[2]);
    const lows = originKLineList.map((data) => data[3]);
    const closes = originKLineList.map((data)=>data[4])
    const chandeKrollStopIndicator = new ChandeKrollStop(atrLength, atrMultiplier, stopLength, highs, lows,closes);
    const { stopShort, stopLong } = chandeKrollStopIndicator.calculateChandeKrollStopArray();
    return {
        stopLong,stopShort
    }
}




