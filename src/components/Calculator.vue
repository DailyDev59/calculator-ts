<template>
  <div class="calculator">
    <button class="history">
      <img src="./../assets/img/icons8-history-48.png" alt="" />
    </button>
    <div class="display">
      <p class="calc">
        {{ output || '0' }}
      </p>
      <p class="result">{{ subtotal || '0' }}</p>
    </div>
    <div class="keyboard-up">
      <button @click="clearLastCharacter" class="brown">Backspace</button>
      <button @click="clearLastNumber" class="brown">CE</button>
      <button @click="clearCalculator" class="brown">C</button>
    </div>
    <div class="keyboard">
      <button @click="clearItem" class="gray">
        <img src="./../assets/img/mc.svg" alt="mc" />
      </button>
      <button @click="saveItem" class="gray ms">ms</button>
      <button @click="minusItem" class="gray ms">m&ndash;</button>
      <button @click="plusItem" class="gray">
        <img src="./../assets/img/m+.svg" alt="m+" />
      </button>
      <button @click="negateValue" class="brown">
        <img src="./../assets/img/plus-minus.svg" alt="plus-minus" />
      </button>
      <button @click="enterNum('%')" class="brown">
        <img
          id="percentage"
          src="./../assets/img/icons8-percentage-100.png"
          alt="percentage"
        />
      </button>
      <button @click="enterNum('÷')" class="brown">
        <img src="./../assets/img/divide.svg" alt="divide" />
      </button>
      <button @click="enterNum('x')" class="brown">
        <img src="./../assets/img/multiply.svg" alt="multiply" />
      </button>
      <button @click="enterNum('7')" class="black">
        <img src="./../assets/img/seven.svg" alt="seven" />
      </button>
      <button @click="enterNum('8')" class="black">
        <img src="./../assets/img/eight.svg" alt="eight" />
      </button>
      <button @click="enterNum('9')" class="black">
        <img src="./../assets/img/nine.svg" alt="nine" />
      </button>
      <button @click="enterNum('-')" class="brown">
        <img src="./../assets/img/minus.svg" alt="minus" />
      </button>
      <button @click="enterNum('4')" class="black">
        <img src="./../assets/img/four.svg" alt="four" />
      </button>
      <button @click="enterNum('5')" class="black">
        <img src="./../assets/img/five.svg" alt="five" />
      </button>
      <button @click="enterNum('6')" class="black">
        <img src="./../assets/img/six.svg" alt="six" />
      </button>
      <button @click="enterNum('+')" class="brown">
        <img src="./../assets/img/plus.svg" alt="plus" />
      </button>
      <button @click="enterNum('1')" class="black">
        <img src="./../assets/img/one.svg" alt="one" />
      </button>
      <button @click="enterNum('2')" class="black">
        <img src="./../assets/img/two.svg" alt="two" />
      </button>
      <button @click="enterNum('3')" class="black">
        <img src="./../assets/img/three.svg" alt="three" />
      </button>
      <button @click="calculate(numOne, numTwo, operator)" class="orange">
        <img src="./../assets/img/equal.svg" alt="equal" />
      </button>
      <button @click="enterNum('0')" class="black box0">
        <img src="./../assets/img/zero.svg" alt="zero" />
      </button>
      <button @click="enterNum(',')" class="black">
        <img src="./../assets/img/comma.svg" alt="comma" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

type op = '+' | '-' | 'x' | '÷' | '%'

let output = ref('')
const numOne = ref('')
const numTwo = ref('')
let subtotal = ref('')
const operator = ref('')

const ops = ['+', '-', 'x', '÷', '%']
const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', ',']
const arrayNumTwo = ref<string[]>([])

let items: string[] = []
const item = ref(items[0])

const enterNum = (val: string) => {
  // if 0-9 entered
  if (numbers.includes(val)) {
    if (!numTwo.value && !operator.value) {
      numOne.value += val
      output.value = numOne.value
    }
    if (numOne.value && operator.value) {
      numTwo.value += val
      output.value = numTwo.value
    }
    console.log(numOne.value, operator.value, numTwo.value)
  }

  // if + - x ÷ entered
  if (ops.includes(val)) {
    operator.value = val
    output.value = operator.value
    // subtotal.value = ''
    console.log(numOne.value, operator.value, numTwo.value)
  }
}

const calculate = (a: string, b: string, op: string): string => {
  switch (op) {
    case '+':
      a = (+a + +b).toString()
      break
    case '-':
      a = (+a - +b).toString()
      break
    case 'x':
      a = (+a * +b).toString()
      break
    case '÷':
      a = (+a / +b).toString()
      break
    case '%':
      return (a = (+a / 100).toString())
  }  
  numOne.value = a
  subtotal.value = a
  numTwo.value = ''  
  output.value = numOne.value
  console.log(numOne.value, operator.value, numTwo.value)
}

const clearCalculator = () => {
  numOne.value = ''
  operator.value = ''
  numTwo.value = ''
  output.value = ''
  subtotal.value = ''
  clearItem()
}

const clearLastNumber = () => {
  if (operator.value) {
    numTwo.value = ''
    subtotal.value = ''
    operator.value = ''
    numOne.value = ''
  }
}

const clearLastCharacter = () => {
  // Combine all components into a single string
  const currentExpression = numOne.value + operator.value + numTwo.value

  if (currentExpression.length === 0) return

  // Remove last character
  const newExpression = currentExpression.slice(0, -1)

  // Parse the new expression back into components
  const opIndex = newExpression.search(/[+\-x÷]/)

  if (opIndex === -1) {
    // No op found - treat everything as numOne
    numOne.value = newExpression
    operator.value = ''
    numTwo.value = ''
  } else {
    // Split into numOne, op, and numTwo
    numOne.value = newExpression.slice(0, opIndex)
    operator.value = newExpression[opIndex]
    numTwo.value = newExpression.slice(opIndex + 1)
  }
}

const negateValue = () => {
  if (operator.value) {
    // negate second operand
    numTwo.value = toggleSign(numTwo.value)
    output.value = numTwo.value
  } else {
    // negate first operand
    numOne.value = toggleSign(numOne.value)
    output.value = numOne.value
  }
}

const toggleSign = (value: string): string => {
  // start negative if empty
  if (value === '') return '-'
  // remove standalone
  if (value === '-') return ''
  return value.startsWith('-') ? value.slice(1) : `-${value}`
}

const saveItem = () => {
  if (subtotal.value || numOne.value) {
    items.push(subtotal.value || numOne.value)
  }
  if (items.length > 1) items.shift()

  console.log(items[0])
}

const clearItem = () => {
  if (items) items = []
}

const plusItem = () => {
  if (subtotal.value || numOne.value) {
    subtotal.value = (
      parseFloat(items[0]) + parseFloat(numOne.value)
    ).toString()
  }
}

const minusItem = () => {
  if (subtotal.value || numOne.value) {
    subtotal.value = (
      parseFloat(numOne.value) - parseFloat(items[0])
    ).toString()
  }
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
