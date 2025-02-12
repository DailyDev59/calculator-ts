<template>
  <div class="calculator">
    <button class="history">
      <img src="./../assets/img/icons8-history-48.png" alt="" />
    </button>
    <div class="display">
      <p class="calc">
        {{ firstOperand || '0' }} {{ operator }} {{ secondOperand }}
      </p>
      <p class="result">{{ result }}</p>
    </div>
    <div class="keyboard-up">
      <button @click="clearLastCharacter" class="brown">Backspace</button>
      <button @click="clearLastNumber" class="brown">CE</button>
      <button @click="clearCalculator" class="brown">C</button>
    </div>
    <div class="keyboard">
      <button class="gray">
        <img src="./../assets/img/mc.svg" alt="mc" />
      </button>
      <button class="gray">
        <img src="./../assets/img/m+.svg" alt="m+" />
      </button>
      <button class="gray ms">
        ms
        
      </button>
      <button class="gray">
        <img src="./../assets/img/mr.svg" alt="mr" />
      </button>
      <button @click="negateValue" class="brown">
        <img src="./../assets/img/plus-minus.svg" alt="plus-minus" />
      </button>
      <button @click="operator = '%'" class="brown">
        <img
          id="percentage"
          src="./../assets/img/icons8-percentage-100.png"
          alt="percentage"
        />
      </button>
      <button @click="operator = '÷'" class="brown">
        <img src="./../assets/img/divide.svg" alt="divide" />
      </button>
      <button @click="operator = 'x'" class="brown">
        <img src="./../assets/img/multiply.svg" alt="multiply" />
      </button>
      <button @click="pressed('7')" class="black">
        <img src="./../assets/img/seven.svg" alt="seven" />
      </button>
      <button @click="pressed('8')" class="black">
        <img src="./../assets/img/eight.svg" alt="eight" />
      </button>
      <button @click="pressed('9')" class="black">
        <img src="./../assets/img/nine.svg" alt="nine" />
      </button>
      <button @click="operator = '-'" class="brown">
        <img src="./../assets/img/minus.svg" alt="minus" />
      </button>
      <button @click="pressed('4')" class="black">
        <img src="./../assets/img/four.svg" alt="four" />
      </button>
      <button @click="pressed('5')" class="black">
        <img src="./../assets/img/five.svg" alt="five" />
      </button>
      <button @click="pressed('6')" class="black">
        <img src="./../assets/img/six.svg" alt="six" />
      </button>
      <button @click="operator = '+'" class="brown">
        <img src="./../assets/img/plus.svg" alt="plus" />
      </button>
      <button @click="pressed('1')" class="black">
        <img src="./../assets/img/one.svg" alt="one" />
      </button>
      <button @click="pressed('2')" class="black">
        <img src="./../assets/img/two.svg" alt="two" />
      </button>
      <button @click="pressed('3')" class="black">
        <img src="./../assets/img/three.svg" alt="three" />
      </button>
      <button @click="calculate()" class="orange">
        <img src="./../assets/img/equal.svg" alt="equal" />
      </button>
      <button @click="pressed('0')" class="black box0">
        <img src="./../assets/img/zero.svg" alt="zero" />
      </button>
      <button @click="pressed(',')" class="black">
        <img src="./../assets/img/comma.svg" alt="comma" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineComponent, ref } from 'vue'

const firstOperand = ref('')
const secondOperand = ref('')
const currentNum = ref('')
const result = ref('')
const operators = ['+', '-', 'x', '÷', '%']
const operator = ref('')
const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', ',']

const pressed = (value: string) => {
  if (!operator.value) {
    firstOperand.value = firstOperand.value + value
  } else {
    secondOperand.value = secondOperand.value + value
  }
}

const calculate = (): string => {
  switch (operator.value) {
    case '+':
      return (result.value = (
        +firstOperand.value + +secondOperand.value
      ).toString())
    case '-':
      return (result.value = (
        +firstOperand.value - +secondOperand.value
      ).toString())
    case 'x':
      return (result.value = (
        +firstOperand.value * +secondOperand.value
      ).toString())
    case '÷':
      if (secondOperand.value === '0') {
        throw Error('Error. Division by zero')
      } else {
        return (result.value = (
          +firstOperand.value / +secondOperand.value
        ).toString())
      }
    case '%':
      return (result.value = (+firstOperand.value / 100).toString())
  }
}

const clearCalculator = () => {
  firstOperand.value = ''
  operator.value = ''
  secondOperand.value = ''
  result.value = ''
}

const clearLastNumber = () => {
  if (operator.value) {
    secondOperand.value = ''
    result.value = ''
  }
}

const clearLastCharacter = () => {
  // Combine all components into a single string
  const currentExpression =
    firstOperand.value + operator.value + secondOperand.value

  if (currentExpression.length === 0) return

  // Remove last character
  const newExpression = currentExpression.slice(0, -1)

  // Parse the new expression back into components
  const operatorIndex = newExpression.search(/[+\-x÷]/)

  if (operatorIndex === -1) {
    // No operator found - treat everything as firstOperand
    firstOperand.value = newExpression
    operator.value = ''
    secondOperand.value = ''
  } else {
    // Split into firstOperand, operator, and secondOperand
    firstOperand.value = newExpression.slice(0, operatorIndex)
    operator.value = newExpression[operatorIndex]
    secondOperand.value = newExpression.slice(operatorIndex + 1)
  }
}

const negateValue = () => {
  if (operator.value) {
    // negate second operand
    return (secondOperand.value = toggleSign(secondOperand.value))
  } else {
    // negate first operand
    firstOperand.value = toggleSign(firstOperand.value)
  }
}

const toggleSign = (value: string): string => {
  // start negative if empty
  if (value === '') return '-'
  // remove standalone
  if (value === '-') return ''
  return value.startsWith('-') ? value.slice(1) : `-${value}`
}
</script>

<style scoped>
.calculator {
  max-width: 470px;
  width: 100%;
  height: 875px;
  background-color: #090909;
  color: white;
  margin: 0 auto;
  border-radius: 70px;
  padding-top: 1.5em;
}
.history {
  border: 0;
  background-color: #090909;
  cursor: pointer;
  margin: 0 0 20px 50px;
}
.display {
  margin: 0 auto;
  max-width: 429px;
  width: 100%;
  max-height: 118px;
  height: 100%;
  background: linear-gradient(
    to bottom,
    #e8ead8 0%,
    #d2d6b7 38%,
    #dbdec1 61%,
    #edefe0 100%
  );
  color: black;
  line-height: 1;
  text-align: right;
}
.calc {
  margin: 0;
  font-size: 3rem;
  font-weight: bold;
  padding: 15px;
}
.result {
  margin: 0;
  font-size: 1.5rem;
  font-weight: bold;
  padding-right: 15px;
}
.keyboard-up {
  display: grid;
  padding: 18px;
  grid-template-columns: repeat(3, 1fr);
  column-gap: 15px;
}
.keyboard-up button {
  min-height: 57px;
  font-family: Inter, sans-serif;
  font-size: 1.6em;
  font-weight: 700;
  color: #ffffff;
  border-radius: 8px;
  cursor: pointer;
}
.keyboard {
  margin: 0 auto;
  padding: 18px;
  display: grid;
  grid-template-columns: repeat(4, minmax(60px, 1fr));
  column-gap: 14px;
  max-width: 429px;
  row-gap: 26px;
}
.keyboard button {
  border-radius: 8px;
  cursor: pointer;
}
img {
  display: block;
  margin-left: -4px;
  margin-top: -1px;
}
.box0 {
  grid-column: span 2;
}
.gray {
  background: linear-gradient(to bottom, #8e9294 30%, #2e373b 90%);
}
.brown {
  background: linear-gradient(to bottom, #efb187 30%, #392314 90%);
}
.black {
  background: linear-gradient(to bottom, #6e6e6e 30%, #040404 90%);
}
.orange {
  background: linear-gradient(to bottom, #f69545 30%, #411e01 90%);
  grid-row: span 2;
  /* height: 136px; */
}
#parenthesis {
  font-family: Inter, sans-serif;
  font-size: 1.6em;
  font-weight: 700;
  color: #ffffff;
}
#percentage {
  display: inline;
  width: 44px;
}
.ms {
  color: #ffffff;
  font-weight: 600;
  font-size: 1.6rem;
}
</style>
