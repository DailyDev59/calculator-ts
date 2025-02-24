export class CalcMethods {
  prevNum: number
  operator: string
  currentNum: number

  add(prevNum: number, selectedOperation: string, currentNum: number) {
    return prevNum + currentNum
  }
  subtract(a: number, b: number) {
    return a - b
  }
  multiply(a: number, b: number) {
    return a * b
  }
  divide(a: number, b: number) {
    return a / b
  }
}
