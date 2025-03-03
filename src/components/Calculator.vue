<template>
  <div class="calculator">
    <button class="history">
      <img src="./../assets/img/icons8-history-48.png" alt="" />
    </button>
    <div class="display">
      <p class="calc">{{ expression }}{{ currentInput }}</p>
      <p
        v-if="expression.includes('%') || (expression && currentInput)"
        class="result"
      >
        {{ formattedSubtotal }}
      </p>
    </div>
    <div class="keyboard-up">
      <button class="brown">Backspace</button>
      <button class="brown">CE</button>
      <button @click="clear" class="brown">C</button>
    </div>
    <div class="keyboard">
      <button class="gray ms">( )</button>
      <button class="gray ms">ms</button>
      <button class="gray ms">m&ndash;</button>
      <button class="gray">
        <img src="./../assets/img/m+.svg" alt="m+" />
      </button>
      <button class="brown">
        <img src="./../assets/img/plus-minus.svg" alt="plus-minus" />
      </button>
      <button @click="handleOperator('%')" class="brown">
        <img
          id="percentage"
          src="./../assets/img/icons8-percentage-100.png"
          alt="percentage"
        />
      </button>
      <button @click="handleOperator('÷')" class="brown">
        <img src="./../assets/img/divide.svg" alt="divide" />
      </button>
      <button @click="handleOperator('x')" class="brown">
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
      <button @click="handleOperator('-')" class="brown">
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
      <button @click="handleOperator('+')" class="brown">
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
      <button @click="handleEqual" class="orange">
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
import { ref, computed } from 'vue'

const expression = ref('')
const currentInput = ref('')
const percentageToken = ref('')
const subtotal = ref<number | null>(null)
const total = ref('')
const OPERATORS = new Set(['+', '-', 'x', '÷'])

const normalizeExpression = (expr: string): string => {
  return expr.replace(/,/g, '.') // Replace commas with dots
}

const enterNum = (digit: string) => {
  currentInput.value += digit
  const expr = expression.value + currentInput.value
  subtotal.value = evaluateExpression(expr)
}

const handleOperator = (operator: string) => {
  if (currentInput.value) {
    // If there's current input, append it and the operator
    expression.value += currentInput.value + operator
    currentInput.value = ''
    subtotal.value = evaluateExpression(expression.value)
  } else if (expression.value) {
    const lastChar = expression.value[expression.value.length - 1]

    // Disallow double percentage operators (%%)
    if (operator === '%' && lastChar === '%') {
      // Do nothing if the last character is already '%'
      return
    }

    // Allow percentage-related operators (e.g., %+, %-)
    if (lastChar === '%') {
      expression.value += operator
    }
    // Check if the last character is an operator (excluding '%')
    else if (OPERATORS.has(lastChar)) {
      // Replace the last operator
      expression.value = expression.value.slice(0, -1) + operator
    } else {
      // Append the new operator
      expression.value += operator
    }

    subtotal.value = evaluateExpression(expression.value)
  }
}

const evaluateExpression = (expr: string): number | null => {
  if (!expr) return null

  // Normalize input: replace commas with dots
  const normalizedExpr = normalizeExpression(expr)

  // Token merging logic with decimal support
  const rawTokens = normalizedExpr.match(/(\d*\.?\d+|\+|-|x|÷|%)/g) || []
  const mergedTokens: string[] = []
  for (let i = 0; i < rawTokens.length; i++) {
    const token = rawTokens[i]
    if (
      token === '%' &&
      mergedTokens.length > 0 &&
      /\d*\.?\d+$/.test(mergedTokens[mergedTokens.length - 1])
    ) {
      mergedTokens[mergedTokens.length - 1] += '%' // Merge with previous number
    } else {
      mergedTokens.push(token)
    }
  }

  let stack: number[] = []
  let currentOperator: string | null = null

  for (const token of mergedTokens) {
    if (token.endsWith('%')) {
      const number = parseFloat(token.slice(0, -1))
      if (currentOperator) {
        const prevNumber = stack.pop()!
        switch (currentOperator) {
          case '+':
            // X + (X * Y%)
            stack.push(
              roundToDecimal(prevNumber + prevNumber * (number / 100), 10)
            )
            break
          case '-':
            // X - (X * Y%)
            stack.push(
              roundToDecimal(prevNumber - prevNumber * (number / 100), 10)
            )
            break
          case 'x':
            // X * (Y / 100)
            stack.push(roundToDecimal(prevNumber * (number / 100), 10))
            break
          case '÷':
            // X / (Y / 100)
            stack.push(roundToDecimal(prevNumber / (number / 100), 10))
            break
        }
        currentOperator = null // Reset operator after use
      } else {
        // Standalone percentage (e.g., "100%")
        stack.push(roundToDecimal(number / 100, 10))
      }
    } else if (/\d*\.?\d+/.test(token)) {
      const number = parseFloat(token)
      if (currentOperator) {
        const prevNumber = stack.pop()!
        switch (currentOperator) {
          case '+':
            stack.push(roundToDecimal(prevNumber + number, 10))
            break
          case '-':
            stack.push(roundToDecimal(prevNumber - number, 10))
            break
          case 'x':
            stack.push(roundToDecimal(prevNumber * number, 10))
            break
          case '÷':
            stack.push(roundToDecimal(prevNumber / number, 10))
            break
        }
        currentOperator = null
      } else {
        stack.push(number)
      }
    } else if (/[\+\-x÷]/.test(token)) {
      currentOperator = token
    }
  }

  return stack.length > 0 ? roundToDecimal(stack[0], 10) : null // Round final result
}

const formatSubtotal = (result: number | null): string => {
  if (result === null) return ''
  return result.toString().replace(/\./g, ',') // Replace dots with commas
}

const formattedSubtotal = computed(() => formatSubtotal(subtotal.value))

const roundToDecimal = (value: number, decimals: number): number => {
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}

const handleEqual = () => {
  if (
    currentInput.value ||
    percentageToken.value ||
    expression.value.includes('%')
  ) {
    expression.value += currentInput.value
    currentInput.value = ''
    const expr = expression.value + currentInput.value
    subtotal.value = evaluateExpression(expr)
    expression.value = ''
    currentInput.value = formattedSubtotal.value.toString()
    subtotal.value = null
  }
}

const clear = () => {
  expression.value = ''
  currentInput.value = ''
  subtotal.value = null
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
  color: #6b31e1;
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
  font-size: 1.8rem;
}
</style>
