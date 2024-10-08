import { PSAR } from "technicalindicators";

 export default function calcPSAR({originKLineList, step=0.02,max=0.2}) {
    let input = {
        high:[],
        low:[],
        step:step,
        max:max
    }
    originKLineList.map(klineItem => {
        input.high.push(klineItem[2])
        input.low.push(klineItem[3])
      })
    let PSARinstance = new PSAR(input)
    return PSARinstance.getResult()
}