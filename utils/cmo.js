let previousClose
let cmos = []
let changes = []
let absoluteChanges = []

function average(nums) {
  return nums.reduce((a, b) => a + b) / nums.length;
}

function cmoCalc(closeData, periods = 9) {
  cmos = closeData.map((CLOSE, index) => {
    let change;
    if (previousClose === undefined) {
      previousClose = CLOSE;
      return null;
    }

    change = CLOSE - previousClose;
    changes.push(change);
    absoluteChanges.push(Math.abs(change));

    if (changes.length < periods) {
      return null;
    } else if (changes.length > periods) {
      changes.shift();
      absoluteChanges.shift();
    }

    previousClose = CLOSE;
    
    let cmo = 100 * (average(changes) / average(absoluteChanges));
    return cmo
  })
  return cmos.slice(-1)[0]
}

module.exports = cmoCalc
